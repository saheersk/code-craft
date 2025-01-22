import os
import time

import subprocess
from .celery_app import celery_app  # noqa: F401
from celery import shared_task

from .language_executor_factory import LanguageExecutorFactory


import logging
logger = logging.getLogger(__name__)


@shared_task
def execute_submission(language_id, source_code, stdin, expected_output):
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

        if result.returncode == 0 and result.stdout.strip() == expected_output:
            return {
                    "status": "success",
                    "output": result.stdout.strip(),
                    "execution_time_ms": execution_time
                }
        else:
            return {
                    "status": "failure", "output": result.stdout.strip(),
                    "error": result.stderr.strip(),
                    "execution_time_ms": execution_time
                }

    except subprocess.TimeoutExpired:
        logger.error("Execution timed out")
        return {"status": "error", "message": "Execution timed out"}

    except Exception as e:
        logger.exception("Error occurred during execution")
        return {"status": "error", "message": str(e)}
