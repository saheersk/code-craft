from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from code.tasks import execute_submission

app = FastAPI()


# Define the structure of the incoming data
class Submission(BaseModel):
    language_id: int
    source_code: str
    stdin: str
    expected_output: Optional[str]
    callback_url: str


class BatchSubmission(BaseModel):
    submissions: List[Submission]


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI in Turborepo!"}


@app.post("/submissions/batch")
async def receive_submissions(batch_submission: BatchSubmission):
    try:
        # print("Received batch submission:", batch_submission.dict())
        
        # Test Celery connection first
        # try:
        #     test_result = celery_app.send_task('test_task')
        #     print("Test task ID:", test_result.id)
        # except Exception as e:
        #     print("Celery connection error:", str(e))
        #     raise HTTPException(
        #         status_code=503,
        #         detail=f"Celery connection error: {str(e)}"
        #     )
        
        # task_result = add.delay(4, 6)
        # print(f"Task result: {task_result}")
        task_ids = []
        for submission in batch_submission.submissions:
            # print(f"Queuing task for submission: {submission.source_code}") 
            task = execute_submission.delay(
                submission.language_id,
                submission.source_code,
                submission.stdin,
                submission.expected_output
            )
            # print("======queue task=====")
            task_ids.append(task.id)

        return {"message": "Submissions queued", "task_ids": task_ids}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error queuing submissions: {str(e)}")