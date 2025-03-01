// EnhancedAgentService.js
export const enhancedAgentService = {
    async getAgentResponse(question, userAnswer, country, visaType) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Question categories for more organized feedback
      const questionCategories = {
        intentToReturn: ['plans after completing', 'after your studies', 'after completing your course'],
        studyChoice: ['Why did you choose', 'Why have you chosen'],
        finances: ['finance your', 'support yourself financially', 'living expenses'],
        academicBackground: ['academic background', 'relate to your chosen field'],
        familyTies: ['family members', 'ties to your home country'],
        careerPlans: ['help your career', 'benefit your future career'],
        visitPurpose: ['purpose of your visit', 'why do you want to visit']
      };
      
      // Find category of question
      let category = 'general';
      for (const [cat, keywords] of Object.entries(questionCategories)) {
        if (keywords.some(keyword => question.toLowerCase().includes(keyword.toLowerCase()))) {
          category = cat;
          break;
        }
      }
      
      // Analyze answer length
      const wordCount = userAnswer.split(/\s+/).filter(Boolean).length;
      let lengthFeedback = "";
      
      if (wordCount < 15) {
        lengthFeedback = "Your answer is quite brief. In a real interview, providing more details can help establish your case better.";
      } else if (wordCount > 150) {
        lengthFeedback = "Your answer is quite detailed, which is good, but try to be concise in a real interview as officers have limited time.";
      }
      
      // Country-specific feedback elements
      const countrySpecificTips = {
        US: {
          F1: " For US F1 visas, demonstrating strong ties to your home country is particularly important.",
          'B1/B2': " For B1/B2 visas, being clear about your specific plans and return date is crucial."
        },
        UK: {
          student: " UK student visa interviews often focus on your financial arrangements and course details."
        },
        CA: {
          student: " Canadian student visa officers look for how your studies fit into your long-term career plans."
        }
      };
      
      const countryTip = countrySpecificTips[country]?.[visaType] || "";
      
      // Category-specific feedback
      let feedback = "";
      
      switch(category) {
        case 'intentToReturn':
          if (userAnswer.toLowerCase().includes("return") && 
              (userAnswer.toLowerCase().includes("home") || userAnswer.toLowerCase().includes("country"))) {
            feedback = "Strong answer. You've clearly stated your intention to return to your home country, which addresses a key concern for visa officers.";
          } else {
            feedback = "Consider explicitly mentioning your plans to return to your home country. Immigration officers need to be convinced you don't intend to immigrate permanently.";
          }
          break;
          
        case 'studyChoice':
          const academicReasons = ["program", "university", "research", "faculty", "academic", "education", "quality", "ranking"];
          const mentionsAcademic = academicReasons.some(term => userAnswer.toLowerCase().includes(term));
          
          if (mentionsAcademic) {
            feedback = "Good approach highlighting academic reasons for your choice. This shows your focus is on education rather than immigration.";
          } else {
            feedback = "Try to emphasize specific academic reasons for choosing this country/institution. Mention program quality, faculty expertise, or research opportunities that aren't available elsewhere.";
          }
          break;
          
        case 'finances':
          const financialTerms = ["scholarship", "savings", "sponsor", "parents", "loan", "fund", "bank"];
          const mentionsFinances = financialTerms.some(term => userAnswer.toLowerCase().includes(term));
          
          if (mentionsFinances) {
            feedback = "Good job addressing your financial situation. Clear financial planning demonstrates you're a serious student who has prepared properly.";
          } else {
            feedback = "Be more specific about your financial arrangements. Officers need to know you can support yourself without unauthorized work.";
          }
          break;
          
        case 'careerPlans':
          if (userAnswer.toLowerCase().includes("career") || 
              userAnswer.toLowerCase().includes("job") || 
              userAnswer.toLowerCase().includes("profession")) {
            feedback = "Good connection between your studies and career goals. This helps establish that your educational plan makes sense.";
          } else {
            feedback = "Try to draw a clearer connection between this specific program and your career goals back home. This helps establish the logic of your educational plan.";
          }
          break;
          
        case 'visitPurpose':
          if (userAnswer.toLowerCase().includes("return") && userAnswer.toLowerCase().includes("days") || 
              userAnswer.toLowerCase().includes("weeks") || userAnswer.toLowerCase().includes("months")) {
            feedback = "Good job mentioning a specific timeframe and return plans, which addresses key concerns for visitor visas.";
          } else {
            feedback = "Be very specific about the length of your stay and your plans to return. For visitor visas, clear temporary intent is crucial.";
          }
          break;
          
        default:
          // General feedback based on confidence and clarity
          const hesitationWords = ["maybe", "probably", "i think", "possibly", "not sure", "um", "uh"];
          const soundsHesitant = hesitationWords.some(term => userAnswer.toLowerCase().includes(term));
          
          if (soundsHesitant) {
            feedback = "Try to sound more confident in your answers. Hesitation can sometimes be interpreted as uncertainty or dishonesty.";
          } else {
            feedback = "Good, clear response. Maintain this confident approach throughout your interview.";
          }
      }
      
      // Combine feedback elements
      return `${feedback}${lengthFeedback ? " " + lengthFeedback : ""}${countryTip}`;
    },
    
    getPreInterviewTips(country, visaType) {
      const generalTips = [
        "Answer truthfully and consistently with your application documents",
        "Speak clearly and confidently",
        "Be concise but thorough in your responses",
        "Maintain appropriate eye contact",
        "Dress professionally",
        "Bring all required documentation"
      ];
      
      const specificTips = {
        US: {
          F1: [
            "Be prepared to demonstrate strong ties to your home country",
            "Clearly articulate your study plans and how they relate to your career goals",
            "Be ready to explain how you'll finance your education",
            "Demonstrate knowledge about your chosen institution and program"
          ],
          'B1/B2': [
            "Have clear plans for your visit with specific dates",
            "Be prepared to show evidence of funds for your trip",
            "Demonstrate strong ties to your home country",
            "Have a clear intention to return after your visit"
          ]
        },
        UK: {
          student: [
            "Be prepared to discuss your chosen course in detail",
            "Demonstrate how this specific UK qualification will benefit your career",
            "Be ready to explain your financial arrangements clearly",
            "Show knowledge of UK student visa regulations"
          ]
        },
        CA: {
          student: [
            "Be prepared to explain why you chose Canada specifically",
            "Demonstrate knowledge of your institution and program",
            "Clearly explain your study-to-work plans if applicable",
            "Be ready to discuss your financial arrangements"
          ]
        }
      };
      
      return {
        general: generalTips,
        specific: specificTips[country]?.[visaType] || []
      };
    },
    
    getCommonMistakes(country, visaType) {
      const commonMistakes = [
        "Being vague about post-study plans",
        "Showing lack of knowledge about chosen institution",
        "Giving inconsistent answers compared to application documents",
        "Appearing unprepared or hesitant",
        "Mentioning unauthorized work intentions",
        "Failing to demonstrate financial capacity"
      ];
      
      return commonMistakes;
    }
  };