#!/usr/bin/env python3
"""
Cyber-Guess // Futuristic Number Guessing Game Server
Built using Python standard library (http.server), HTML, and CSS.
Zero external dependencies required.
"""

import http.server
import json
import math
import os
import random
import socketserver
import sys
import urllib.parse
from http import HTTPStatus

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class GameSession:
    """Manages game logic, secret generation, proximity, and intel hints."""

    def __init__(self, min_val=1, max_val=100, max_attempts=7):
        self.min_val = min_val
        self.max_val = max_val
        self.max_attempts = max_attempts
        self.attempts_left = max_attempts
        self.secret_number = random.randint(min_val, max_val)
        self.game_over = False
        self.won = False
        self.guesses = []
        self.hints_given = []

    def evaluate_guess(self, guess: int) -> dict:
        """Evaluates a player's guess against the secret number."""
        if self.game_over:
            return {
                "error": "Game is already completed.",
                "game_over": True,
                "result": "win" if self.won else "lose",
                "secret": self.secret_number,
            }

        self.guesses.append(guess)
        self.attempts_left -= 1
        diff = abs(self.secret_number - guess)
        span = max(1, self.max_val - self.min_val)
        pct_diff = diff / span

        # Determine proximity feedback
        if pct_diff <= 0.05:
            proximity = "hot"
            proximity_desc = "🔥 Scorching Hot! You are razor close."
        elif pct_diff <= 0.15:
            proximity = "warm"
            proximity_desc = "⚡ Warm! Getting closer to the frequency."
        else:
            proximity = "cold"
            proximity_desc = "❄️ Cold signal. Still far off target."

        if guess == self.secret_number:
            self.game_over = True
            self.won = True
            score = self._calculate_score()
            return {
                "result": "win",
                "secret": self.secret_number,
                "attempts_left": self.attempts_left,
                "difference": 0,
                "score": score,
                "message": f"Spot on! The security cipher was {self.secret_number}.",
            }

        if self.attempts_left <= 0:
            self.game_over = True
            self.won = False
            return {
                "result": "lose",
                "secret": self.secret_number,
                "attempts_left": 0,
                "difference": diff,
                "score": 0,
                "direction": "higher" if self.secret_number > guess else "lower",
                "message": f"System locked! The number was {self.secret_number}.",
            }

        direction = "higher" if self.secret_number > guess else "lower"
        return {
            "result": "continue",
            "direction": direction,
            "difference": diff,
            "proximity": proximity,
            "attempts_left": self.attempts_left,
            "message": f"{proximity_desc} (Aim {direction.upper()})",
        }

    def generate_hint(self) -> str:
        """Generates dynamic mathematical intel about the secret number."""
        available_hints = []
        num = self.secret_number

        # 1. Even or Odd
        parity = "EVEN" if num % 2 == 0 else "ODD"
        h_parity = f"The target code is an {parity} number."
        if h_parity not in self.hints_given:
            available_hints.append(h_parity)

        # 2. Divisibility check
        divisors = [3, 5, 7, 10, 11]
        divisible_by = [d for d in divisors if num % d == 0]
        if divisible_by:
            chosen = random.choice(divisible_by)
            h_div = f"The number is evenly divisible by {chosen}."
            if h_div not in self.hints_given:
                available_hints.append(h_div)
        else:
            h_div = "The number is NOT divisible by 2, 3, or 5."
            if h_div not in self.hints_given:
                available_hints.append(h_div)

        # 3. Prime / Composite
        is_prime = self._is_prime(num)
        h_prime = f"Classification: {'PRIME' if is_prime else 'COMPOSITE (non-prime)'} number."
        if h_prime not in self.hints_given:
            available_hints.append(h_prime)

        # 4. Sum of digits
        digit_sum = sum(int(ch) for ch in str(num))
        h_digits = f"The sum of the digits equals {digit_sum}."
        if h_digits not in self.hints_given:
            available_hints.append(h_digits)

        # 5. Halfway comparison
        midpoint = (self.min_val + self.max_val) // 2
        comp = "strictly greater than" if num > midpoint else "less than or equal to"
        h_mid = f"The number is {comp} {midpoint}."
        if h_mid not in self.hints_given:
            available_hints.append(h_mid)

        if not available_hints:
            return f"Final clue: The code ends with the digit {num % 10}."

        chosen_hint = random.choice(available_hints)
        self.hints_given.append(chosen_hint)
        return chosen_hint

    def _is_prime(self, n: int) -> bool:
        if n < 2:
            return False
        for i in range(2, int(math.isqrt(n)) + 1):
            if n % i == 0:
                return False
        return True

    def _calculate_score(self) -> int:
        attempts_used = self.max_attempts - self.attempts_left
        efficiency = (self.max_attempts - attempts_used + 1) / self.max_attempts
        base = (self.max_val - self.min_val) * 10
        return int(base * efficiency) + (100 * self.attempts_left)


# Active global game session
current_session = GameSession(min_val=1, max_val=100, max_attempts=7)


class GameHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP Request Handler serving frontend files and JSON APIs."""

    def log_message(self, format, *args):
        # Clean formatted console log
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    def _send_json_response(self, data: dict, status_code=HTTPStatus.OK):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/index.html"]:
            self._serve_file(
                os.path.join(BASE_DIR, "templates", "index.html"), "text/html"
            )
            return

        if path.startswith("/static/"):
            rel_path = path[len("/static/") :]
            file_path = os.path.join(BASE_DIR, "static", rel_path)
            content_type = "text/plain"
            if file_path.endswith(".css"):
                content_type = "text/css"
            elif file_path.endswith(".js"):
                content_type = "application/javascript"
            elif file_path.endswith(".svg"):
                content_type = "image/svg+xml"
            self._serve_file(file_path, content_type)
            return

        if path == "/api/stats":
            self._send_json_response(
                {
                    "min": current_session.min_val,
                    "max": current_session.max_val,
                    "attempts_left": current_session.attempts_left,
                    "max_attempts": current_session.max_attempts,
                }
            )
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Resource not found")

    def do_POST(self):
        global current_session
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            payload = json.loads(post_data.decode("utf-8")) if post_data else {}
        except json.JSONDecodeError:
            self._send_json_response(
                {"error": "Invalid JSON payload"}, HTTPStatus.BAD_REQUEST
            )
            return

        if path == "/api/new-game":
            min_val = int(payload.get("min", 1))
            max_val = int(payload.get("max", 100))
            max_attempts = int(payload.get("max_attempts", 7))
            current_session = GameSession(
                min_val=min_val, max_val=max_val, max_attempts=max_attempts
            )
            self._send_json_response(
                {
                    "status": "initialized",
                    "min": current_session.min_val,
                    "max": current_session.max_val,
                    "max_attempts": current_session.max_attempts,
                }
            )
            return

        if path == "/api/guess":
            guess_val = payload.get("guess")
            if guess_val is None:
                self._send_json_response(
                    {"error": "Missing 'guess' parameter"},
                    HTTPStatus.BAD_REQUEST,
                )
                return
            result = current_session.evaluate_guess(int(guess_val))
            self._send_json_response(result)
            return

        if path == "/api/hint":
            hint_str = current_session.generate_hint()
            self._send_json_response({"hint": hint_str})
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")

    def _serve_file(self, full_path: str, content_type: str):
        if not os.path.exists(full_path):
            self.send_error(HTTPStatus.NOT_FOUND, f"File {full_path} not found")
            return
        try:
            with open(full_path, "rb") as f:
                content = f.read()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(
                HTTPStatus.INTERNAL_SERVER_ERROR, f"Error reading file: {e}"
            )


def run_server():
    # Attempt to bind to requested port or fallback
    target_port = PORT
    for port in [target_port, 8080, 5000, 3000, 8888]:
        try:
            server_address = ("127.0.0.1", port)
            httpd = socketserver.TCPServer(
                server_address, GameHTTPRequestHandler
            )
            httpd.allow_reuse_address = True
            print("==================================================")
            print("   🎮 CYBER-GUESS // NUMBER QUEST SERVER ONLINE    ")
            print("==================================================")
            print(f"-> Local URL: http://localhost:{port}")
            print(f"-> Mode: Standalone Python HTTP Server")
            print("-> Press Ctrl+C to stop the server.\n")
            httpd.serve_forever()
            return
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            raise e
    print(f"Could not bind to any test port.")


if __name__ == "__main__":
    run_server()