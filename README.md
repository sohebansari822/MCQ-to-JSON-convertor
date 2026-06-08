# Question Bank Builder

A simple tool for teachers to build a JSON question library for the school test module.

## Project Structure

```
question-bank-project/
│
├── index.html          ← Main page (HTML structure only)
├── style.css           ← All styles and design tokens
├── app.js              ← All JavaScript logic
└── question_bank.json  ← Your question library (add all JSON here)
```

---

## How to use

1. Open `index.html` in any browser (double-click the file)
2. Fill in: **Class**, **Subject**, **Chapter number**, **Chapter name**
3. Type each question and its 4 options (A, B, C, D)
4. Click the **circle badge (A/B/C/D)** to mark the correct answer — it turns green
5. Click **Copy JSON** to copy the output
6. Paste the copied JSON into `question_bank.json`

---

## question_bank.json format

The file is an **array** of class+subject objects.
Each object has chapters, and each chapter has questions.

```json
[
  {
    "class": "5",
    "subject": "Mathematics",
    "chapters": [
      {
        "chapterNumber": 1,
        "chapterName": "Fractions",
        "questions": [
          {
            "id": "q001",
            "text": "What is 1/2 + 1/4?",
            "options": ["1/4", "3/4", "1/2", "2/4"],
            "correctOption": 1
          }
        ]
      }
    ]
  }
]
```

### correctOption values
| Value | Means |
|-------|-------|
| 0     | Option A is correct |
| 1     | Option B is correct |
| 2     | Option C is correct |
| 3     | Option D is correct |
| -1    | No answer selected  |

---

## How your app reads this file

```javascript
// Example: get all questions for Class 5, Maths, Chapter 1
fetch('question_bank.json')
  .then(res => res.json())
  .then(bank => {
    const subject = bank.find(s => s.class === '5' && s.subject === 'Mathematics');
    const chapter = subject.chapters.find(c => c.chapterNumber === 1);
    const questions = chapter.questions;
    console.log(questions); // array of question objects
  });
```
