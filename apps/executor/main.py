from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from celery.result import AsyncResult
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
        task_ids = []
        for submission in batch_submission.submissions:
            print(f"Queuing task for submission: {submission.source_code}")
            print(f"Queuing task for input: {submission.stdin}")
            print(f"Queuing task for ouput: {submission.expected_output}")
            task = execute_submission.delay(
                submission.language_id,
                submission.source_code,
                submission.stdin,
                submission.expected_output,
                submission.callback_url
            )
            # print("======queue task=====")
            task_ids.append(task.id)

        return {"message": "Submissions queued", "task_ids": task_ids}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error queuing submissions: {str(e)}")


@app.get("/tasks/{task_id}")
async def check_task_status(task_id: str):
    try:
        task_result = AsyncResult(task_id)

        status = task_result.status
        result = task_result.result if task_result.ready() else None

        return {
            "task_id": task_id,
            "status": status,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error checking task status: {str(e)}")