// Mock AI Health Intelligence Engine
// AI-assisted health risk analysis (non-diagnostic)

export interface SymptomInput {
  name: string;
  severity: number; // 1–10
}

export interface HealthAnalysisInput {
  symptoms: string[] | SymptomInput[]; // Accept both string array and object array
  severity?: number; // Overall severity (used when symptoms is string[])
  sleepScore: number;
  allergies: string[];
  pastDiagnoses: string[];
  age?: number;
  smoking?: boolean;
  alcohol?: boolean;
  activityLevel?: "active" | "moderate" | "sedentary";
}

export interface HealthAnalysisResult {
  healthRiskScore: number;
  urgencyLevel: "normal" | "monitor" | "emergency";
  recommendedDoctorType: string;
  reasoning: string[];
  summary: string;
  detailedAnalysis: {
    symptomImpact: number;
    sleepImpact: number;
    lifestyleImpact: number;
    medicalHistoryImpact: number;
  };
}

// -------------------- WEIGHTS --------------------

const symptomWeights: Record<string, number> = {
  "chest-tightness": 30,
  "chest-pain": 30,
  dizziness: 15,
  headache: 10,
  fatigue: 12,
  anxiety: 10,
  nausea: 10,
  fever: 15,
  cough: 8,
  "shortness-of-breath": 20,
  "rapid-heartbeat": 18,
  weakness: 10,
  confusion: 15,
};

const diagnosisRiskFactors: Record<string, number> = {
  "Type 2 Diabetes": 15,
  "Hypertension (High BP)": 20,
  Asthma: 12,
  "Heart Disease": 25,
  "Thyroid Disorder": 8,
  "Anxiety Disorder": 10,
  "Sleep Apnea": 12,
  COPD: 18,
  Depression: 8,
};

// -------------------- HELPER FUNCTIONS --------------------

function normalizeSymptoms(
  symptoms: string[] | SymptomInput[],
  defaultSeverity: number = 5
): SymptomInput[] {
  if (symptoms.length === 0) return [];

  // Check if it's an array of strings or objects
  if (typeof symptoms[0] === "string") {
    return (symptoms as string[]).map((name) => ({
      name,
      severity: defaultSeverity,
    }));
  }

  return symptoms as SymptomInput[];
}

// -------------------- MAIN AI FUNCTION --------------------

export function analyzeHealth(
  input: HealthAnalysisInput
): HealthAnalysisResult {
  let score = 0;
  const reasoning: string[] = [];
  
  // Track impact categories
  let symptomImpact = 0;
  let sleepImpact = 0;
  let lifestyleImpact = 0;
  let medicalHistoryImpact = 0;

  // Normalize symptoms to SymptomInput format
  const normalizedSymptoms = normalizeSymptoms(
    input.symptoms,
    input.severity || 5
  );

  // -------------------- SYMPTOM ANALYSIS --------------------
  if (normalizedSymptoms.length > 0) {
    normalizedSymptoms.forEach((symptom) => {
      const weight = symptomWeights[symptom.name] || 8;
      const impact = weight * (symptom.severity / 10);
      score += impact;
      symptomImpact += impact;

      if (symptom.severity >= 8) {
        reasoning.push(
          `⚠️ High severity ${symptom.name.replace("-", " ")} (${symptom.severity}/10) detected - requires immediate attention`
        );
      } else if (symptom.severity >= 6) {
        reasoning.push(
          `⚡ Moderate ${symptom.name.replace("-", " ")} (${symptom.severity}/10) reported`
        );
      }
    });

    if (normalizedSymptoms.length >= 3) {
      score += 10;
      symptomImpact += 10;
      reasoning.push(
        `🔴 Multiple symptoms (${normalizedSymptoms.length}) detected - indicates potential systemic issue`
      );
    } else {
      reasoning.push(
        `📊 ${normalizedSymptoms.length} active symptom(s) analyzed`
      );
    }
  } else {
    reasoning.push("✅ No active symptoms reported today");
  }

  // -------------------- SLEEP ANALYSIS --------------------
  if (input.sleepScore < 40) {
    score += 25;
    sleepImpact += 25;
    reasoning.push(
      `😴 Critical sleep deficiency (Score: ${input.sleepScore}/100) - severely impacting immune system and cognitive function`
    );
  } else if (input.sleepScore < 60) {
    score += 15;
    sleepImpact += 15;
    reasoning.push(
      `🌙 Poor sleep quality (Score: ${input.sleepScore}/100) - increasing stress and inflammation markers`
    );
  } else if (input.sleepScore < 75) {
    score += 8;
    sleepImpact += 8;
    reasoning.push(
      `💤 Suboptimal sleep (Score: ${input.sleepScore}/100) - room for improvement`
    );
  } else {
    reasoning.push(
      `✨ Good sleep quality (Score: ${input.sleepScore}/100) - supporting overall health`
    );
  }

  // -------------------- MEDICAL HISTORY --------------------
  if (input.pastDiagnoses && input.pastDiagnoses.length > 0) {
    input.pastDiagnoses.forEach((diagnosis) => {
      const risk = diagnosisRiskFactors[diagnosis] || 5;
      score += risk;
      medicalHistoryImpact += risk;
      reasoning.push(`🏥 Pre-existing condition: ${diagnosis} (+${risk} risk points)`);
    });

    if (input.pastDiagnoses.length >= 2) {
      score += 8;
      medicalHistoryImpact += 8;
      reasoning.push(
        `⚕️ Multiple chronic conditions require coordinated care management`
      );
    }
  }

  // -------------------- LIFESTYLE FACTORS --------------------
  if (input.smoking) {
    score += 15;
    lifestyleImpact += 15;
    reasoning.push(
      "🚬 Smoking significantly increases cardiovascular and respiratory risks"
    );
  }

  if (input.alcohol) {
    score += 8;
    lifestyleImpact += 8;
    reasoning.push("🍺 Regular alcohol consumption affects liver and metabolic health");
  }

  if (input.activityLevel === "sedentary") {
    score += 12;
    lifestyleImpact += 12;
    reasoning.push(
      "🪑 Sedentary lifestyle increases risk of metabolic syndrome and cardiovascular issues"
    );
  } else if (input.activityLevel === "active") {
    score -= 5; // Bonus for active lifestyle
    reasoning.push("🏃 Active lifestyle is supporting cardiovascular health");
  }

  // -------------------- AGE FACTORS --------------------
  if (input.age) {
    if (input.age > 65) {
      score += 18;
      medicalHistoryImpact += 18;
      reasoning.push(
        "👴 Age-related health considerations require regular monitoring"
      );
    } else if (input.age > 50) {
      score += 12;
      medicalHistoryImpact += 12;
      reasoning.push("🧓 Middle-age risk factors applied for preventive care");
    } else if (input.age > 35) {
      score += 5;
      medicalHistoryImpact += 5;
      reasoning.push("📈 Age-appropriate health screening recommended");
    }
  }

  // -------------------- ALLERGY CONSIDERATIONS --------------------
  if (input.allergies && input.allergies.length > 0) {
    score += input.allergies.length * 2;
    medicalHistoryImpact += input.allergies.length * 2;
    reasoning.push(
      `🤧 ${input.allergies.length} known allergy/allergies documented for medication safety`
    );
  }

  // Normalize score (0-100 scale)
  const healthRiskScore = Math.min(100, Math.max(0, Math.round(score)));

  // -------------------- URGENCY & RECOMMENDATIONS --------------------
  let urgencyLevel: "normal" | "monitor" | "emergency" = "normal";
  let recommendedDoctorType = "General Physician";

  // Check for emergency symptoms
  const hasChestPain = normalizedSymptoms.some(
    (s) => s.name === "chest-tightness" || s.name === "chest-pain"
  );
  const hasBreathingIssue = normalizedSymptoms.some(
    (s) => s.name === "shortness-of-breath"
  );
  const hasSevereSymptom = normalizedSymptoms.some((s) => s.severity >= 8);

  if (hasChestPain && hasSevereSymptom) {
    urgencyLevel = "emergency";
    recommendedDoctorType = "Cardiologist / Emergency Room";
    reasoning.push(
      "🚨 EMERGENCY: Chest pain with high severity - seek immediate medical attention"
    );
  } else if (healthRiskScore >= 75 || hasSevereSymptom) {
    urgencyLevel = "emergency";
    recommendedDoctorType = hasChestPain
      ? "Cardiologist"
      : hasBreathingIssue
      ? "Pulmonologist"
      : "Emergency Medicine Specialist";
    reasoning.push(
      "🔴 HIGH RISK: Immediate medical consultation strongly recommended"
    );
  } else if (healthRiskScore >= 50) {
    urgencyLevel = "monitor";
    
    // Determine specialist based on symptoms and history
    if (input.pastDiagnoses?.includes("Asthma") || hasBreathingIssue) {
      recommendedDoctorType = "Pulmonologist";
    } else if (input.pastDiagnoses?.includes("Heart Disease")) {
      recommendedDoctorType = "Cardiologist";
    } else if (input.pastDiagnoses?.includes("Type 2 Diabetes")) {
      recommendedDoctorType = "Endocrinologist";
    } else if (normalizedSymptoms.length >= 2) {
      recommendedDoctorType = "General Physician (Internal Medicine)";
    }
    
    reasoning.push("🟡 MONITOR: Schedule medical checkup within 48-72 hours");
  } else if (healthRiskScore >= 30) {
    urgencyLevel = "monitor";
    recommendedDoctorType = "General Physician";
    reasoning.push("🟢 ROUTINE: Monitor symptoms and schedule regular checkup");
  } else {
    reasoning.push("✅ STABLE: Continue healthy habits and preventive care");
  }

  return {
    healthRiskScore,
    urgencyLevel,
    recommendedDoctorType,
    reasoning,
    summary: generateSummary(healthRiskScore, urgencyLevel, input, normalizedSymptoms),
    detailedAnalysis: {
      symptomImpact: Math.round(symptomImpact),
      sleepImpact: Math.round(sleepImpact),
      lifestyleImpact: Math.round(lifestyleImpact),
      medicalHistoryImpact: Math.round(medicalHistoryImpact),
    },
  };
}

// -------------------- SUMMARY GENERATION --------------------

function generateSummary(
  score: number,
  urgency: "normal" | "monitor" | "emergency",
  input: HealthAnalysisInput,
  symptoms: SymptomInput[]
): string {
  const riskLevel =
    score < 25
      ? "minimal"
      : score < 45
      ? "low"
      : score < 65
      ? "moderate"
      : score < 80
      ? "elevated"
      : "high";

  let summary = `Your current health risk assessment is ${score}/100 (${riskLevel} risk). `;

  // Symptom summary
  if (symptoms.length > 0) {
    const severeSymptoms = symptoms.filter((s) => s.severity >= 7);
    if (severeSymptoms.length > 0) {
      summary += `You have reported ${severeSymptoms.length} severe symptom(s) that require attention. `;
    } else {
      summary += `You have logged ${symptoms.length} symptom(s) with mild to moderate severity. `;
    }
  } else {
    summary += "No active symptoms reported today. ";
  }

  // Sleep summary
  if (input.sleepScore < 50) {
    summary += "Your sleep quality is critically low and significantly impacting your health. ";
  } else if (input.sleepScore < 70) {
    summary += "Sleep quality needs improvement for optimal recovery. ";
  } else {
    summary += "Sleep patterns are supporting your health. ";
  }

  // Medical history
  if (input.pastDiagnoses && input.pastDiagnoses.length > 0) {
    summary += `Your medical history (${input.pastDiagnoses.length} condition(s)) requires ongoing monitoring. `;
  }

  // Action items
  if (urgency === "emergency") {
    summary +=
      "⚠️ Based on current indicators, immediate medical consultation is strongly recommended. Do not delay seeking professional care.";
  } else if (urgency === "monitor") {
    summary +=
      "📋 Please monitor your symptoms closely and consult a healthcare provider within 2-3 days if symptoms persist or worsen.";
  } else {
    summary +=
      "✅ Continue maintaining healthy habits, daily health logging, and preventive care routines.";
  }

  return summary;
}

// -------------------- SLEEP SCORE CALCULATION --------------------

export function calculateSleepScore(
  hours: number,
  quality: "excellent" | "good" | "average" | "poor"
): number {
  let score = 0;

  // Base score from hours
  if (hours >= 7 && hours <= 9) {
    score = 70; // Optimal range
  } else if (hours >= 6 && hours < 7) {
    score = 55; // Slightly below optimal
  } else if (hours >= 5 && hours < 6) {
    score = 40; // Insufficient
  } else if (hours < 5) {
    score = 25; // Critically low
  } else if (hours > 9 && hours <= 10) {
    score = 60; // Too much sleep
  } else {
    score = 40; // Excessive sleep
  }

  // Quality bonus
  const qualityBonus = {
    excellent: 30,
    good: 20,
    average: 10,
    poor: 0,
  };

  const finalScore = Math.min(100, score + qualityBonus[quality]);

  return finalScore;
}

// -------------------- BLOCKCHAIN ACCESS KEY --------------------

export function generateAccessKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const hex = "abcdef0123456789";

  const generate = (len: number, source: string) =>
    Array.from({ length: len }, () =>
      source.charAt(Math.floor(Math.random() * source.length))
    ).join("");

  return {
    accessKey: `${generate(4, chars)}-${generate(4, chars)}-${generate(
      4,
      chars
    )}-${generate(4, chars)}`,
    keyHash: generate(64, hex),
  };
}