from flask import Flask, render_template, request, jsonify
import os
import pytz
import requests
import time
import math
from datetime import timezone, datetime, timedelta, date
from zoneinfo import ZoneInfo
from pagerank import pagerank, get_graph_file


app = Flask(__name__)

if __name__ == "__main__":
    app.run(debug=True)


