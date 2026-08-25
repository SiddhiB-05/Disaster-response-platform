import os
import json
import re
from typing import Dict, Any
from app.config import settings

class GeminiExtractionService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[Gemini Service] Warning: Failed to initialize Gemini API client: {e}")
                self.client = None

    def extract_incident_metadata(self, description: str, fallback_incident_type: str = "Other") -> Dict[str, Any]:
        """
        Extract structured JSON metadata from unstructured citizen text report.
        Output format:
        {
          "incident_type": "Flood",
          "severity": "High",       # High, Medium, Low
          "people_affected": 8,      # integer
          "vulnerable_people": True, # boolean
          "urgency": "High"          # High, Medium, Low
        }
        """
        if self.client:
            try:
                prompt = f"""
You are an expert emergency NLP metadata extraction AI for a live disaster coordination center.
Analyze the following citizen report description and return ONLY a strict JSON object with NO markdown wrapping, codeblocks, or explanatory text.

Citizen Description:
"{description}"

Extracted Incident Type Hint: "{fallback_incident_type}"

Required JSON Schema:
{{
  "incident_type": "Flood" | "Cyclone" | "Landslide" | "Medical Emergency" | "Road Blockage" | "Building Damage" | "Fire" | "Water Shortage" | "Other",
  "severity": "High" | "Medium" | "Low",
  "people_affected": integer,
  "vulnerable_people": boolean,
  "urgency": "High" | "Medium" | "Low"
}}

Rules:
1. "incident_type" must be one of the enumerated values (default to "{fallback_incident_type}" if unsure).
2. "severity" is "High" if life-threatening or severe structural danger, "Medium" if significant disruption, "Low" if minor.
3. "people_affected" must be an estimated count of people directly affected (default to 1 if unspecified, extract numbers like "8 people", "two elderly" -> 2).
4. "vulnerable_people" should be true if children, elderly, pregnant women, or sick individuals are mentioned.
5. "urgency" is "High" if immediate life-saving response is required.
"""
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                
                raw_text = response.text.strip()
                # Strip markdown json wrappers if present
                clean_json = re.sub(r"^```json\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
                parsed = json.loads(clean_json)
                
                # Sanitize response fields
                return self._sanitize_extracted_data(parsed, fallback_incident_type)
            except Exception as err:
                print(f"[Gemini Service] API Call failed ({err}). Falling back to heuristic extractor.")

        # Fallback heuristic parser
        return self._heuristic_fallback_extraction(description, fallback_incident_type)

    def _sanitize_extracted_data(self, data: Dict[str, Any], fallback_type: str) -> Dict[str, Any]:
        valid_types = ["Flood", "Cyclone", "Landslide", "Medical Emergency", "Road Blockage", "Building Damage", "Fire", "Water Shortage", "Other"]
        inc_type = data.get("incident_type", fallback_type)
        if inc_type not in valid_types:
            inc_type = fallback_type if fallback_type in valid_types else "Other"

        severity = str(data.get("severity", "Medium")).capitalize()
        if severity not in ["High", "Medium", "Low"]:
            severity = "Medium"

        urgency = str(data.get("urgency", "Medium")).capitalize()
        if urgency not in ["High", "Medium", "Low"]:
            urgency = "Medium"

        try:
            people = int(data.get("people_affected", 1))
            people = max(1, people)
        except (ValueError, TypeError):
            people = 1

        vulnerable = bool(data.get("vulnerable_people", False))

        return {
            "incident_type": inc_type,
            "severity": severity,
            "people_affected": people,
            "vulnerable_people": vulnerable,
            "urgency": urgency
        }

    def _heuristic_fallback_extraction(self, text: str, fallback_type: str) -> Dict[str, Any]:
        lower_text = text.lower()
        
        # 1. Infer incident type if fallback is generic
        inc_type = fallback_type
        if "flood" in lower_text or "water" in lower_text or "drown" in lower_text or "trapped" in lower_text:
            inc_type = "Flood"
        elif "medical" in lower_text or "patient" in lower_text or "heart" in lower_text or "elderly" in lower_text or "sick" in lower_text or "injured" in lower_text:
            inc_type = "Medical Emergency"
        elif "road" in lower_text or "blocked" in lower_text or "tree" in lower_text or "traffic" in lower_text:
            inc_type = "Road Blockage"
        elif "building" in lower_text or "collapse" in lower_text or "wall" in lower_text:
            inc_type = "Building Damage"
        elif "fire" in lower_text or "smoke" in lower_text or "burn" in lower_text:
            inc_type = "Fire"

        # 2. Extract count of people
        people_affected = 1
        people_matches = re.findall(r'(\d+)\s*(?:people|person|persons|trapped|injured|family|families|citizens|residents|patients|shopkeepers)', lower_text)
        if people_matches:
            people_affected = int(people_matches[0])
        else:
            numbers = [int(n) for n in re.findall(r'\b(\d+)\b', lower_text)]
            if numbers:
                people_affected = max(numbers)
            else:
                word_num_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "several": 5, "many": 10}
                for word, val in word_num_map.items():
                    if f" {word} " in f" {lower_text} ":
                        people_affected = val
                        break

        # 3. Check vulnerable people
        vulnerable_keywords = ["elderly", "old", "child", "children", "baby", "infant", "pregnant", "sick", "disabled"]
        vulnerable_people = any(k in lower_text for k in vulnerable_keywords)

        # 4. Severity & Urgency determination
        high_severity_keywords = ["trapped", "collapse", "drowning", "critical", "bleeding", "unconscious", "immediate", "urgent", "die", "death", "severe"]
        low_severity_keywords = ["minor", "slow", "no drinking water", "small", "inconvenience"]
        
        if any(k in lower_text for k in high_severity_keywords) or people_affected >= 5 or vulnerable_people:
            severity = "High"
            urgency = "High"
        elif any(k in lower_text for k in low_severity_keywords) and people_affected <= 2:
            severity = "Low"
            urgency = "Low"
        else:
            severity = "Medium"
            urgency = "Medium"

        return {
            "incident_type": inc_type,
            "severity": severity,
            "people_affected": people_affected,
            "vulnerable_people": vulnerable_people,
            "urgency": urgency
        }

gemini_extractor = GeminiExtractionService()
