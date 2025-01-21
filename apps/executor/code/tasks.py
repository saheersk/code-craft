from celery import shared_task
import subprocess
from .celery_app import celery_app


import logging
logger = logging.getLogger(__name__)

@shared_task
def execute_submission(language_id, source_code, stdin, expected_output):
    try:
        logger.debug(f"Executing task with language_id={language_id}")
        logger.debug(f"Source Code:\n{source_code}")

        # Save code to file
        with open('/tmp/script.js', 'w') as f:
            f.write(source_code)
            logger.debug("Code saved to /tmp/script.js")

        # Execute code in a sandbox (Docker)
        logger.debug(f"Running Docker container with stdin: {stdin}")
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", "/tmp:/sandbox",
                "--memory=128m", "--cpus=0.5",
                "--network=none", "node-sandbox",
                "node", "/sandbox/script.js"
            ],
            input=stdin, text=True, capture_output=True, timeout=10
        )
        print(result, "======")
        print(result.stdout, "======stdout")
        logger.debug(f"Docker result: {result.stdout}")

        # Compare output
        if result.stdout.strip() == expected_output:
            return {"status": "success", "output": result.stdout}
        else:
            return {"status": "failure", "output": result.stdout}

    except subprocess.TimeoutExpired:
        logger.error("Execution timed out")
        return {"status": "error", "message": "Execution timed out"}

    except Exception as e:
        logger.error(f"Error occurred: {str(e)}")
        return {"status": "error", "message": str(e)}