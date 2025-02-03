import os
import time
from enum import Enum

import subprocess
from .celery_app import celery_app  # noqa: F401
from celery import shared_task

from .language_executor_factory import LanguageExecutorFactory
from .utils import send_to_callback_api

import logging
logger = logging.getLogger(__name__)


class SubmissionStatus(Enum):
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    RUNTIME_ERROR = "Runtime Error (NZEC)"
    COMPILATION_ERROR = "Compilation Error"
    TIME_LIMIT_EXCEEDED = "Time Limit Exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded"
    WRONG_ANSWER = "Wrong Answer"


@shared_task(bind=True)
def execute_submission(self, language_id, source_code, stdin, expected_output, callback_url):
    try:
        logger.info(f"Executing task: language_id={language_id}")

        sandbox_dir = f"/tmp/sandbox/{time.time()}"
        os.makedirs(sandbox_dir, exist_ok=True)

        executor = LanguageExecutorFactory.get_executor(language_id)

        executor.setup_code(source_code, stdin, sandbox_dir)

        start_time = time.time()

        result = executor.execute(sandbox_dir)

        execution_time = (time.time() - start_time) * 1000
        logger.info(f"Task execution time: {execution_time:.2f} ms")
        logger.info(f"Docker command result: {result}")
        logger.info(f"Docker stdout: {result.stdout}")
        logger.info(f"Docker stderr: {result.stderr}")
        logger.info(f"Expected stderr: {expected_output}")

        if result.returncode != 0:
            if result.stderr:
                if "error" in result.stderr.lower():
                    description = SubmissionStatus.RUNTIME_ERROR.value
                else:
                    description = SubmissionStatus.COMPILATION_ERROR.value
            else:
                description = SubmissionStatus.RUNTIME_ERROR.value

            status = "failure"
            output = result.stderr.strip()
            error = result.stderr.strip()
        elif result.stdout.strip() == expected_output:
            description = SubmissionStatus.ACCEPTED.value
            status = "success"
            output = result.stdout.strip()
            error = None
        else:
            description = SubmissionStatus.WRONG_ANSWER.value
            status = "failure"
            output = result.stdout.strip()
            error = result.stderr.strip()

        result_data = {
            "stdout": status or None,
            "time": f"{execution_time:.2f} ms" if execution_time else None,
            "memory": None,
            "stderr": error or None,
            "token": self.request.id,
            "compile_output": None,
            "message": output or None,
            "status": {
                "id": 1,
                "description": description,
            },
        }
        # logger.info(f"self.request.id::   {self.request.id}")
        # logger.info(f"Result::   {result_data}")
        # logger.info(f"callback: {callback_url}")
        send_to_callback_api(callback_url, result_data)

        return result_data

    except subprocess.TimeoutExpired:
        logger.error("Execution timed out")
        result_data = {"status": "error", "message": "Execution timed out", "description": SubmissionStatus.TIME_LIMIT_EXCEEDED.value}
        send_to_callback_api(callback_url, result_data)
        return result_data

    except Exception as e:
        logger.exception("Error occurred during execution")
        result_data = {"status": "error", "message": str(e), "description": SubmissionStatus.RUNTIME_ERROR.value}
        send_to_callback_api(callback_url, result_data)
        return result_data

# @shared_task
# def execute_submission(language_id, source_code, stdin, expected_output):
#     try:
#         logger.info(f"Executing task: language_id={language_id}")

#         sandbox_dir = f"/tmp/sandbox/{time.time()}"
#         os.makedirs(sandbox_dir, exist_ok=True)

#         executor = LanguageExecutorFactory.get_executor(language_id)

#         executor.setup_code(source_code, stdin, sandbox_dir)

#         start_time = time.time()

#         result = executor.execute(sandbox_dir)

#         execution_time = (time.time() - start_time) * 1000
#         logger.info(f"Task execution time: {execution_time:.2f} ms")

#         logger.info(f"Docker command result: {result}")
#         logger.info(f"Docker stdout: {result.stdout}")
#         logger.info(f"Docker stderr: {result.stderr}")

#         if result.returncode == 0 and result.stdout.strip() == expected_output:
#             return {
#                     "status": "success",
#                     "output": result.stdout.strip(),
#                     "execution_time_ms": execution_time
#                 }
#         else:
#             return {
#                     "status": "failure", "output": result.stdout.strip(),
#                     "error": result.stderr.strip(),
#                     "execution_time_ms": execution_time
#                 }

#     except subprocess.TimeoutExpired:
#         logger.error("Execution timed out")
#         return {"status": "error", "message": "Execution timed out"}

#     except Exception as e:
#         logger.exception("Error occurred during execution")
#         return {"status": "error", "message": str(e)}
