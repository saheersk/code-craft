import requests
from typing import Dict

import logging
logger = logging.getLogger(__name__)


def send_to_callback_api(callback_url: str, result: Dict):
    try:
        response = requests.put(callback_url, json=result)
        # print(response, "==============response")
        # logger.info(response, "==============response")
        if response.status_code == 200:
            logger.info("Successfully sent the result to the callback API")
        else:
            print(f"Failed to send data to callback API. Status code: {response.status_code}")
            logger.error(f"Failed to send data to callback API. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending data to callback API: {e}")