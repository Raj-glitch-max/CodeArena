from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine, Base, AsyncSessionLocal
from app.models import User, Algorithm, Submission, Challenge, Battle  # Added Battle
from app.core.security import hash_password


async def init_db() -> None:
    """Initialize database with tables and seed data."""
    print("🗄️  Initializing CodeArena database...")
    
    async with engine.begin() as conn:
        print("📦 Creating tables...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:  # type: AsyncSession
        # Create dev user
        user = await session.get(User, 1)
        if not user:
            print("👤 Creating dev user...")
            user = User(
                username="dev",
                email="dev@example.com",
                password_hash=hash_password("password123"),
                rating=1000
            )
            session.add(user)
            await session.flush()
        else:
            user.password_hash = hash_password("password123")
        
        # Create additional test users
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.username == "alice"))
        if not result.scalars().first():
            print("👥 Creating test users...")
            session.add_all([
                User(username="alice", email="alice@example.com", password_hash=hash_password("password123"), rating=1200, battles_won=15, battles_lost=5),
                User(username="bob", email="bob@example.com", password_hash=hash_password("password123"), rating=950, battles_won=8, battles_lost=12),
                User(username="charlie", email="charlie@example.com", password_hash=hash_password("password123"), rating=1500, battles_won=25, battles_lost=8, win_streak=5),
            ])
            await session.flush()
        
        # Ensure dev has an algorithm
        algo = None
        result = await session.execute(select(Algorithm).where(Algorithm.user_id == 1))
        algo = result.scalars().first()
        if not algo:
            print("🧬 Creating dev algorithm...")
            algo = Algorithm(
                user_id=1,
                code="def solve(nums, target):\n    # Sample solution\n    return [0, 1]\n",
                language="python",
                name="QuickSort Master",
                is_alive=True,
                death_count=0,
                generation=1,
                traits=[],
            )
            session.add(algo)
            await session.flush()
        
        # Seed comprehensive problems
        result = await session.execute(select(Challenge))
        existing_count = len(result.scalars().all())
        
        if existing_count < 5:
            print(f"📚 Seeding {20 - existing_count} coding problems...")
            problems = [
                Challenge(
                    title="Two Sum",
                    slug="two-sum",
                    difficulty="easy",
                    description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    tags=["array", "hash-table"],
                    examples=[
                        {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] == 9"},
                    ],
                    starter_code={
                        "python": "def twoSum(nums: List[int], target: int) -> List[int]:\n    pass",
                        "javascript": "function twoSum(nums, target) {\n    // Your code here\n}",
                    },
                    test_cases=[{"input": "[2,7,11,15], 9", "output": "[0,1]", "is_hidden": False}],
                ),
                Challenge(
                    title="Reverse String",
                    slug="reverse-string",
                    difficulty="easy",
                    description="Write a function that reverses a string. The input string is given as an array of characters s.",
                    tags=["string", "two-pointers"],
                    examples=[
                        {"input": '["h","e","l","l","o"]', "output": '["o","l","l","e","h"]'},
                    ],
                    starter_code={
                        "python": "def reverseString(s: List[str]) -> None:\n    pass",
                        "javascript": "function reverseString(s) {\n    // Your code here\n}",
                    },
                    test_cases=[{"input": '["h","e","l","l","o"]', "output": '["o","l","l","e","h"]', "is_hidden": False}],
                ),
                Challenge(
                    title="Valid Parentheses",
                    slug="valid-parentheses",
                    difficulty="easy",
                    description="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                    tags=["string", "stack"],
                    examples=[
                        {"input": '"()"', "output": "true"},
                        {"input": '"()[]{"', "output": "true"},
                        {"input": '"(]"', "output": "false"},
                    ],
                    starter_code={
                        "python": "def isValid(s: str) -> bool:\n    pass",
                        "javascript": "function isValid(s) {\n    // Your code here\n}",
                    },
                    test_cases=[{"input": '"()"', "output": "true", "is_hidden": False}],
                ),
                Challenge(
                    title="Longest Substring Without Repeating Characters",
                    slug="longest-substring",
                    difficulty="medium",
                    description="Given a string s, find the length of the longest substring without repeating characters.",
                    tags=["string", "sliding-window", "hash-table"],
                    examples=[
                        {"input": '"abcabcbb"', "output": "3", "explanation": 'The answer is "abc", with the length of 3.'},
                    ],
                    starter_code={
                        "python": "def lengthOfLongestSubstring(s: str) -> int:\n    pass",
                        "javascript": "function lengthOfLongestSubstring(s) {\n    // Your code here\n}",
                    },
                    test_cases=[{"input": '"abcabcbb"', "output": "3", "is_hidden": False}],
                ),
                Challenge(
                    title="Container With Most Water",
                    slug="container-most-water",
                    difficulty="medium",
                    description="You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
                    tags=["array", "two-pointers", "greedy"],
                    examples=[
                        {"input": "[1,8,6,2,5,4,8,3,7]", "output": "49"},
                    ],
                    starter_code={
                        "python": "def maxArea(height: List[int]) -> int:\n    pass",
                    },
                    test_cases=[{"input": "[1,8,6,2,5,4,8,3,7]", "output": "49", "is_hidden": False}],
                ),
                Challenge(
                    title="Merge Intervals",
                    slug="merge-intervals",
                    difficulty="medium",
                    description="Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
                    tags=["array", "sorting"],
                    examples=[
                        {"input": "[[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"},
                    ],
                    starter_code={
                        "python": "def merge(intervals: List[List[int]]) -> List[List[int]]:\n    pass",
                    },
                    test_cases=[{"input": "[[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]", "is_hidden": False}],
                ),
                Challenge(
                    title="Binary Tree Level Order Traversal",
                    slug="binary-tree-level-order",
                    difficulty="medium",
                    description="Given the root of a binary tree, return the level order traversal of its nodes' values.",
                    tags=["tree", "breadth-first-search"],
                    examples=[
                        {"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"},
                    ],
                    starter_code={
                        "python": "def levelOrder(root: TreeNode) -> List[List[int]]:\n    pass",
                    },
                    test_cases=[{"input": "[3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]", "is_hidden": False}],
                ),
                Challenge(
                    title="Coin Change",
                    slug="coin-change",
                    difficulty="medium",
                    description="You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
                    tags=["dynamic-programming", "array"],
                    examples=[
                        {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"},
                    ],
                    starter_code={
                        "python": "def coinChange(coins: List[int], amount: int) -> int:\n    pass",
                    },
                    test_cases=[{"input": "[1,2,5], 11", "output": "3", "is_hidden": False}],
                ),
                Challenge(
                    title="Median of Two Sorted Arrays",
                    slug="median-two-sorted-arrays",
                    difficulty="hard",
                    description="Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
                    tags=["array", "binary-search", "divide-and-conquer"],
                    examples=[
                        {"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0"},
                    ],
                    starter_code={
                        "python": "def findMedianSortedArrays(nums1: List[int], nums2: List[int]) -> float:\n    pass",
                    },
                    test_cases=[{"input": "[1,3], [2]", "output": "2.0", "is_hidden": False}],
                ),
                Challenge(
                    title="Trapping Rain Water",
                    slug="trapping-rain-water",
                    difficulty="hard",
                    description="Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
                    tags=["array", "two-pointers", "dynamic-programming"],
                    examples=[
                        {"input": "[0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
                    ],
                    starter_code={
                        "python": "def trap(height: List[int]) -> int:\n    pass",
                    },
                    test_cases=[{"input": "[0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6", "is_hidden": False}],
                ),
            ]
            session.add_all(problems)
            await session.flush()
        
        await session.commit()
        
        print("✅ Database initialization complete!")
        print(f"   - Users: dev (password: password123)")
        print(f"   - Test users: alice, bob, charlie (password: password123)")
        print(f"   - Algorithms: {algo.name if algo else 'N/A'}")
        print(f"   - Problems: 10 seeded")


if __name__ == "__main__":
    asyncio.run(init_db())
