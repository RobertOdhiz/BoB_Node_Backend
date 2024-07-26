# Define variables
$serverUrl = "http://localhost:5000"
$email = <your email>
$password = <your password>

# Function to authenticate and get the auth token
function Get-AuthToken {
    param (
        [string]$serverUrl,
        [string]$email,
        [string]$password
    )
    try {
        $body = @{
            email = $email
            password = $password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$serverUrl/users/login" -Body $body -ContentType "application/json" -Method Post
        return $response.token
    } catch {
        Write-Error "Error logging in: $_"
        return $null
    }
}

# Function to answer assessment questions
function Answer-AssessmentQuestions {
    param (
        [string]$serverUrl,
        [string]$authToken,
        [array]$questions
    )
    try {
        $answers = @()

        # Sample answers - adjust these according to the actual questions and their IDs
        foreach ($question in $questions) {
            $answer = ""

            # Choose answers based on question category or specific question
            switch ($question.category) {
                "Income Information" {
                    switch ($question.id) {
                        "4d70a426-f204-4f1d-beab-1572df15d8cb" { $answer = "50000" } # Example income amount
                        "3c43cada-2aaf-41c2-9ea5-c2d2a9a607f1" { $answer = "Employment" } # Example source of income
                    }
                }
                "Expenses and Debt" {
                    switch ($question.id) {
                        "0f53be1c-a8e9-4114-a390-30d5b472ef08" { $answer = "15000" } # Example rent/mortgage expense
                        "26e82f70-4311-4d88-b4c9-6d0e286d8170" { $answer = "7000" } # Example groceries and transportation expense
                        "f43a7877-21fd-4636-b50f-f2f49527abd6" { $answer = "3000" } # Example other expenses
                        "10fa9a5b-0d6b-4c49-b570-87f5ae8dc947" { $answer = "10000-19999" } # Example monthly expense range
                    }
                }
                "One More..." {
                    switch ($question.id) {
                        "af101a95-77de-42db-af49-df577e4bbbc4" { $answer = "Vacation" } # Example saving goal
                    }
                }
                Default {
                    $answer = "Sample answer for question: $($question.question)" # Default sample answer
                }
            }

            $answers += @{
                questionId = $question.id
                answer = $answer
            }
        }

        $body = @{
            answers = $answers
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$serverUrl/assessments/answers" -Headers @{
            "x-token" = "$authToken"
        } -Body $body -ContentType "application/json" -Method Post

        Write-Output "Answers submitted successfully:"
        $response | ConvertTo-Json -Depth 4 | Write-Output
    } catch {
        Write-Error "Error submitting answers: $_"
    }
}

# Main script
$authToken = Get-AuthToken -serverUrl $serverUrl -email $email -password $password
if ($authToken) {
    # Hardcoded questions from the response based on your example
    $questions = @(
        @{
            question = "How much do you spend on Rent/Mortgage and Household Bills each month?"
            id = "0f53be1c-a8e9-4114-a390-30d5b472ef08"
            category = "Expenses and Debt"
        },
        @{
            question = "What’s your monthly expense range?"
            id = "10fa9a5b-0d6b-4c49-b570-87f5ae8dc947"
            category = "Expenses and Debt"
        },
        @{
            question = "How much do you spend on Groceries and Transportation each month?"
            id = "26e82f70-4311-4d88-b4c9-6d0e286d8170"
            category = "Expenses and Debt"
        },
        @{
            question = "What is your primary source of income?"
            id = "3c43cada-2aaf-41c2-9ea5-c2d2a9a607f1"
            category = "Income Information"
        },
        @{
            question = "How much is your monthly income?"
            id = "4d70a426-f204-4f1d-beab-1572df15d8cb"
            category = "Income Information"
        },
        @{
            question = "What are you saving for?"
            id = "af101a95-77de-42db-af49-df577e4bbbc4"
            category = "One More..."
        },
        @{
            question = "How much do you spend on Other expenses each month?"
            id = "f43a7877-21fd-4636-b50f-f2f49527abd6"
            category = "Expenses and Debt"
        }
    )

    Answer-AssessmentQuestions -serverUrl $serverUrl -authToken $authToken -questions $questions
}
