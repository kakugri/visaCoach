// Mock service to simulate agent responses for local testing
export const mockAgentService = {
    async getAgentResponse(question, userAnswer) {
      // Simulate some basic feedback based on keywords in user response (very rudimentary)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
      let feedback = "Good response."; // Default feedback
  
      if (question.includes("plans after completing studies")) {
        if (userAnswer.toLowerCase().includes("return to my home country")) {
          feedback = "Excellent. Clearly stating your intention to return home is important.";
        } else {
          feedback = "Consider emphasizing your plans to return to your home country after your studies to address potential concerns.";
        }
      } else if (question.includes("Why did you choose to study in the United States")) {
        if (userAnswer.toLowerCase().includes("best universities") || userAnswer.toLowerCase().includes("research opportunities")) {
          feedback = "Strong points. Highlighting academic reasons is a good approach.";
        } else {
          feedback = "Focus on academic reasons for choosing the US. Avoid mentioning personal reasons that might raise suspicion.";
        }
      } // Add more mock feedback logic for other questions as needed
  
      return feedback;
    },
  };