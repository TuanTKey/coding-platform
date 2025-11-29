#!/usr/bin/env python3
"""
Reverse String - solution
Reads all stdin and prints its reversal.
"""
import sys

def reverse_string(s: str) -> str:
    return s[::-1]

if __name__ == "__main__":
    data = sys.stdin.read()
    # Remove trailing newline added by some shells? keep exactly reversed input
    print(reverse_string(data), end='')
