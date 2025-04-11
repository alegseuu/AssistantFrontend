import { Box, Button, Typography, TextField } from "@mui/material";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.jpg";

interface Question {
  id: string;
  text: string;
  options?: string[];
  next?: { [key: string]: string };
  prompt?: { [key: string]: string };
  
}
const questions: Record<string, Question> = {
  start: {
    id: "start",
    text: "How I can help you?",
    options: ["Cold/flu", "Pain/injury", "Alergy/skin problems", "Neurological symptoms", "Heart/Circulation problems", "Another"],
    next: {
      "Cold/flu": "general_questions",
      "Pain/injury": "pain_injury", 
      "Alergy/skin problems": "alergy_skin", 
      "Neurological symptoms": "neurological", 
      "Heart/Circulation problems": "heart_circulation",
      "Another":"another"
    },
    prompt: {
      "Cold/flu": "I have a cold/flu. ",
      "Pain/injury": "I have pain/injury. ",
      "Alergy/skin problems": "I have alergy/skin problems. ",
      "Neurological symptoms": "I have neurological symptoms. ",
      "Heart/Circulation problems": "I have heart/circulation problems. ",
    },
  },
  pain_injury: {
    id: "Pain_injury",
    text: "Where do you have pain/injury?",
    options: ["Headache", "Chest pain", "Stomachache", "Back pain", "Eye pain", "Ear pain", "Leg pain", "Arm pain", "Animal bite"],
    next: {
      "Headache": "headache_question1",
      "Chest pain": "chest_pain_questions",
      "Stomachache": "stomachache_questions",
      "Back pain": "back_pain_questions",
      "Eye pain": "eye_pain_questions",
      "Ear pain": "ear_pain_questions",
      "Leg pain": "leg_pain_questions",
      "Arm pain": "arm_pain_questions",
      "Animal bite": "animal_bite_questions",
    },
    prompt: {
      "Headache": "I have a headache. ",
      "Chest pain": "I have chest pain. ",
      "Stomachache": "I have stomachache. ",
      "Back pain": "I have back pain. ",
      "Eye pain": "I have eye pain. ",
      "Ear pain": "I have ear pain. ",
      "Leg pain": "I have leg pain. ",
      "Arm pain": "I have arm pain. ",
      "Animal bite": "I have an animal bite. ",
    },
  },
  headache_question1: {
    id: "headache_question1",
    text: "What type of pain is it?",
    options: [
      "pulsating", "squeezing","dull","sharp","throbbing"
    ],
    next: { "everything": "headache_question2" },
  },
    headache_question2: {
      id: "headache_questions",
      text: "What type of pain is it?",
      options: [
        "Does the pain start at the back, front, or one side of the head?",
        "Does it worsen with effort, light, or sounds?",
        "Do you have vision disturbances, nausea, or neck stiffness?",
        "Do you experience aura (flashing lights, tingling)?",
      ],
      next: { "everything": "general_questions" },
  },
  chest_pain_questions: {
    id: "chest_pain_questions",
    text: "Please answer the following about your chest pain:",
    options: [
      "Does the pain occur during effort or rest?",
      "Does it radiate to the arm, neck, or jaw?",
      "Is the pain stabbing, crushing, or burning?",
      "Do you experience shortness of breath, cold sweats, or dizziness?",
      "Does it worsen with breathing or position changes?",
    ],
    next: { "everything": "general_questions" },
  },
  stomachache_questions: {
    id: "stomachache_questions",
    text: "Please answer the following about your stomachache:",
    options: [
      "Where exactly does it hurt (upper, lower, right side, etc.)?",
      "Is the pain related to eating?",
      "Do you experience nausea, vomiting, diarrhea, or constipation?",
      "Have you noticed blood in stool or dark stool?",
      "Is your abdomen bloated or tender to touch?",
    ],
    next: { "everything": "general_questions" },
  },
  back_pain_questions: {
    id: "back_pain_questions",
    text: "Please answer the following about your back pain:",
    options: [
      "Does the pain radiate to your legs or buttocks?",
      "Do you experience numbness, tingling, or muscle weakness?",
      "Does it worsen with movement, sitting, or at night?",
      "Do you have trouble urinating or with bowel movements?",
      "Have you had an injury or overexertion?",
    ],
    next: { "everything": "general_questions" },
  },
  eye_pain_questions: {
    id: "eye_pain_questions",
    text: "Please answer the following about your eye pain:",
    options: [
      "Do you see blurry images, spots, or flashes?",
      "Is your eye red or watery?",
      "Do you experience light sensitivity?",
      "Have you had an eye injury or foreign object in the eye?",
      "Do you wear contact lenses?",
    ],
    next: { "everything": "general_questions" },
  },
  ear_pain_questions: {
    id: "ear_pain_questions",
    text: "Please answer the following about your ear pain:",
    options: [
      "Is the pain in one ear or both?",
      "Do you have fever or ear discharge?",
      "Do you hear worse than usual?",
      "Have you recently had an upper respiratory infection?",
      "Does it hurt when chewing or swallowing?",
    ],
    next: { "everything": "general_questions" },
  },
  leg_pain_questions: {
    id: "leg_pain_questions",
    text: "Please answer the following about your leg pain:",
    options: [
      "Does the pain occur when walking and stop at rest?",
      "Do you have swelling, redness, or warmth?",
      "Do you feel numbness or tingling?",
      "Have you had an injury or prolonged immobility?",
      "Is the leg colder or paler than the other?",
    ],
    next: { "everything": "general_questions" },
  },
  arm_pain_questions: {
    id: "arm_pain_questions",
    text: "Please answer the following about your arm pain:",
    options: [
      "Does the pain radiate from the neck or chest?",
      "Do you have limited range of motion?",
      "Do you feel numbness in your fingers?",
      "Have you had an injury?",
      "Does your arm swell or turn blue?",
    ],
    next: { "everything": "general_questions" },
  },
  animal_bite_questions: {
    id: "animal_bite_questions",
    text: "Please answer the following about the animal bite:",
    options: [
      "Was the animal known/unknown and vaccinated?",
      "Did the wound bleed? How deep is it?",
      "Is there redness, swelling, or pus?",
      "Do you have fever or chills?",
      "Have you been vaccinated for tetanus or rabies?",
    ],
    next: { "everything": "general_questions" },
  },
  alergy_skin: {
    id: "Alergy/skin problems",
    text: "What kind of skin problems do you have?",
    options: ["Rash", "Itching", "Skin lesion", "Blisters"],
    next: {
      "Rash": "general_questions",
      "Itching": "general_questions",
      "Swelling": "general_questions",
      "Redness": "general_questions",
      "Blisters": "general_questions",
    },
  },
  neurological: {
    id: "Neurological symptoms",
    text: "What kind of neurological symptoms do you have?",
    options: ["Headache", "Dizziness", "Nausea", "Weakness", "Tremors"],
    next: {
      "Headache": "general_questions",
      "Dizziness": "general_questions",
      "Nausea": "general_questions",
      "Weakness": "general_questions",
      "Tremors": "general_questions",
    },
  },
  heart_circulation: {
    id: "Heart/Circulation problems",
    text: "What kind of heart/circulation problems do you have?",
    options: ["Chest pain", "Shortness of breath", "Palpitations", "Swelling in legs", "Dizziness"],
    next: {
      "Chest pain": "general_questions",
      "Shortness of breath": "general_questions",
      "Palpitations": "general_questions",
      "Swelling in legs": "general_questions",
      "Dizziness": "general_questions",
    },
  },
  another: {
    id: "Another",
    text: "What kind of problems do you have?",
    options: ["Fever", "Cough", "Sore throat", "Fatigue", "Nausea"],
    next: {
      "Fever": "general_questions",
      "Cough": "general_questions",
      "Sore throat": "general_questions",
      "Fatigue": "general_questions",
      "Nausea": "general_questions",
    },
  },
  general_questions: {
    id: "general_questions",
    text: "How long do you have symptoms?",
    options: ["1 day", "2-3 days", "3-7 days", "More than 7 days"],
    next: {
      "1 day": "general_question_2",
      "2-3 days": "general_question_2",
      "3-7 days": "general_question_2",
      "More than 7 days": "general_question_2",
    },
    prompt: {
      "1 day": "I have symptoms for 1 day.",
      "2-3 days": "I have symptoms for 2-3 days. ",
      "3-7 days": "I have symptoms for 3-7 days. ",
      "More than 7 days": "I have symptoms for more than 7 days. ",
    },
  },
  general_question_2: {
    id: "general_question_2",
    text: "Do you suffer from chronic diseases?",
    options: ["Yes", "No"],
    next: {
      "Yes": "chronic_diseases",
      "No": "general_question_3",
    },
    prompt: {
      "Yes": "I suffer from ",
      "No": "I don't suffer from chronic diseases. ",
    },
  },
  chronic_diseases: {
    id: "chronic_diseases",
    text: "What kind of chronic diseases do you have?",
    next: {
      "everything": "general_question_3",
    },
  },
  general_question_3: {
    id: "general_question_3",
    text: "Do you take any medications?",
    options: ["Yes", "No"],
    next: {
      "Yes": "medications",
      "No": "end",
    },
    prompt: {
      "Yes": "I take ",
      "No": "I don't take medications",
    },
  },
  medications: {
    id: "medications",
    text: "What kind of medications do you take?",
    next: {
      "everything": "end",}
  },
  end: {
    id: "end",
    text: "Thank you for completing the interview.",
    options: [],
  },
  
};

export default function MedicalInterview() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions["start"]);
  const [output, setOutput] = useState(""); // Stan dla odpowiedzi tekstowej
  const [textInput, setTextInput] = useState<string>(""); // Stan dla odpowiedzi tekstowej

  const handleOptionClick = (option: string) => {
    if (currentQuestion.prompt) {
      setOutput((prev) => prev + (currentQuestion.prompt?.[option] || "")); // Dodaj tekst do outputu
    }
    const nextId = currentQuestion.next?.[option] ||currentQuestion.next?.["everything"]|| "end";
    setCurrentQuestion(questions[nextId]);
    console.log("Selected option:", output);

    if (nextId === "end") {
      navigate("/home");
    }
  };

  const handleTextSubmit = () => {
    console.log("Text input:", textInput); // Debugging log
    if (textInput.trim()) {
      setOutput((prev) => prev + textInput + ". "); // Dodaj tekst do outputu
      setTextInput(""); // Wyczyść pole tekstowe
    }
    const nextId = currentQuestion.next?.["everything"] || "end"; // Obsługa przejścia dla odpowiedzi tekstowej
    setCurrentQuestion(questions[nextId]);
    console.log("Selected option:", output);
    if (nextId === "end") {
      navigate("/home");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          maxWidth: "500px",
          margin: "auto",
          position: "relative",
          zIndex: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="white" sx={{ mb: 4 }}>
          {currentQuestion.text}
        </Typography>
        <Box>
          {currentQuestion.options ? (
            currentQuestion.options.map((option) => (
              <Button
                key={option}
                variant="outlined"
                onClick={() => handleOptionClick(option)}
                sx={{
                  fontSize: "1.2rem",
                  padding: "1rem 2rem",
                  minWidth: "100px",
                  color: "rgb(255, 255, 255)",
                  borderColor: "rgb(255, 255, 255)",
                  margin: "0.5rem",
                  "&:hover": {
                    backgroundColor: "rgba(33, 53, 71, 0.4)",
                    color: "rgb(255, 255, 255)",
                    borderColor: "rgba(33, 53, 71, 1)",
                  },
                }}
              >
                {option}
              </Button>
            ))
          ) : (
            <Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter your message..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                multiline
                rows = {1}
                sx={{
                  transition: "all 0.3s ease",
                }} />
              <Button
                variant="outlined"
                onClick={handleTextSubmit}
                sx={{
                  fontSize: "1.2rem",
                  padding: "1rem 2rem",
                  borderColor: "rgb(255, 255, 255)",
                  color: "rgb(255, 255, 255)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 53, 71, 0.4)",
                    color: "rgb(255, 255, 255)",
                    borderColor: "rgba(33, 53, 71, 1)",
                  },
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
