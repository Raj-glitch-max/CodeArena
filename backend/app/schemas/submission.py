"""
Pydantic schemas for code submission validation.
"""
from pydantic import BaseModel, Field, field_validator


class CodeSubmissionRequest(BaseModel):
    """Request schema for code submission with strict validation."""
    
    code: str = Field(
        ..., 
        min_length=1,
        max_length=50000,
        description="Source code to execute (max 50KB)"
    )
    problem_id: int = Field(..., gt=0, description="Problem ID being solved")
    language: str = Field(..., pattern="^(python|javascript|rust)$", description="Programming language")
    battle_id: int | None = Field(None, gt=0, description="Optional battle ID if submitting in battle")
    
    @field_validator('code')
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        """Ensure code is not just whitespace."""
        if not v.strip():
            raise ValueError('Code cannot be empty or whitespace-only')
        return v


class RunCodeRequest(BaseModel):
    """Request schema for running code against sample test cases."""
    
    code: str = Field(
        ..., 
        min_length=1,
        max_length=50000,
        description="Source code to run (max 50KB)"
    )
    problem_id: int = Field(..., gt=0, description="Problem ID")
    language: str = Field(..., pattern="^(python|javascript|rust)$", description="Programming language")
    
    @field_validator('code')
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        """Ensure code is not just whitespace."""
        if not v.strip():
            raise ValueError('Code cannot be empty or whitespace-only')
        return v
