from celery import shared_task
import subprocess
from .celery_app import celery_app
import os
import time

import logging
logger = logging.getLogger(__name__)

@shared_task
def execute_submission(language_id, source_code, stdin, expected_output):
    try:
        logger.info(f"Executing task: language_id={language_id}")

        # Save code to file
        sandbox_dir = f"/tmp/sandbox/{time.time()}"  # Unique sandbox directory per task
        os.makedirs(sandbox_dir, exist_ok=True)
        script_path = f"{sandbox_dir}/script.js"
        with open(script_path, 'w') as f:
            f.write(source_code)

        # Write stdin to input.txt (this will overwrite the file each time)
        input_file_path = f"{sandbox_dir}/input.txt"
        with open(input_file_path, 'w') as f:
            f.write(stdin.strip())

        logger.info(f"stdin {stdin}")
        logger.info(f"Code saved to {script_path}")
        logger.info(f"Input saved to {input_file_path}")

        start_time = time.time()

        # Run the Docker container with the updated input handling
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{sandbox_dir}:/sandbox",
                "--memory=128m", "--cpus=0.5",
                "--network=none", "node:23-alpine",
                "node", "/sandbox/script.js"
            ],
            text=True, capture_output=True, timeout=30
        )

        execution_time = time.time() - start_time
        logger.info(f"Task execution time: {execution_time:.2f} seconds")

        logger.info(f"Docker command result: {result}")
        logger.info(f"Docker stdout: {result.stdout}")
        logger.info(f"Docker stderr: {result.stderr}")

        # Compare output
        if result.returncode == 0 and result.stdout.strip() == expected_output:
            return {"status": "success", "output": result.stdout.strip()}
        else:
            return {"status": "failure", "output": result.stdout.strip(), "error": result.stderr.strip()}

    except subprocess.TimeoutExpired:
        logger.error("Execution timed out")
        return {"status": "error", "message": "Execution timed out"}

    except Exception as e:
        logger.exception("Error occurred during execution")
        return {"status": "error", "message": str(e)}