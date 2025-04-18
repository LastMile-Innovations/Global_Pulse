export interface TemplateParameter {
  /**
   * Name of the parameter
   */
  name: string

  /**
   * Whether the parameter is required
   */
  required: boolean

  /**
   * Default value to use if parameter is missing
   */
  defaultValue?: string

  /**
   * Whether to use LLM assistance for filling this parameter
   */
  useLlmAssistance?: boolean

  /**
   * Prompt to use for LLM assistance
   * Can include other parameter values using {param_name} syntax
   */
  llmPrompt?: string
}

/**
 * Response template
 */
export interface ResponseTemplate {
  /**
   * Unique identifier for the template
   */
  id: string

  /**
   * The template string with placeholders
   */
  template: string

  /**
   * Parameters that can be used in the template
   */
  parameters: TemplateParameter[]
}

/**
 * Template library
 */
export interface TemplateLibrary {
  /**
   * Templates grouped by intent
   */
  [intentKey: string]: ResponseTemplate[]
}

/**
 * Pre-authored response templates
 */
export const templates: TemplateLibrary = {
  // Validate uncertainty templates
  validate_uncertainty: [
    {
      id: "validate_uncertainty_1",
      template:
        "It's completely okay to feel unsure about {topic_or_feeling}. Uncertainty is a natural part of processing our experiences.",
      parameters: [
        {
          name: "topic_or_feeling",
          required: true,
          defaultValue: "this",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the specific topic or feeling they're uncertain about. Respond with just the topic or feeling, using no more than 3-4 words.",
        },
      ],
    },
    {
      id: "validate_uncertainty_2",
      template:
        "I notice you seem uncertain about {topic_or_feeling}. That's perfectly normal, and it's okay to sit with that uncertainty for a while.",
      parameters: [
        {
          name: "topic_or_feeling",
          required: true,
          defaultValue: "this",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the specific topic or feeling they're uncertain about. Respond with just the topic or feeling, using no more than 3-4 words.",
        },
      ],
    },
  ],

  // Listening acknowledgment templates
  listening_ack: [
    {
      id: "listening_ack_1",
      template: "I'm here and listening. Please continue when you're ready.",
      parameters: [],
    },
    {
      id: "listening_ack_2",
      template: "I'm present with you. Take your time to express what's on your mind.",
      parameters: [],
    },
    {
      id: "listening_ack_3",
      template: "I'm listening attentively. Feel free to share at your own pace.",
      parameters: [],
    },
  ],

  // Validate high distress templates
  validate_high_distress: [
    {
      id: "validate_high_distress_1",
      template:
        "That sounds incredibly difficult right now{topic_reference}. I want to acknowledge the intensity of what you're experiencing.",
      parameters: [
        {
          name: "topic_reference",
          required: false,
          defaultValue: "",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the topic causing distress. If clear, respond with ' relating to [topic]'. If unclear, respond with an empty string.",
        },
      ],
    },
    {
      id: "validate_high_distress_2",
      template:
        "I can sense this is really painful{topic_reference}. It's important to acknowledge these intense feelings.",
      parameters: [
        {
          name: "topic_reference",
          required: false,
          defaultValue: "",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the topic causing distress. If clear, respond with ' regarding [topic]'. If unclear, respond with an empty string.",
        },
      ],
    },
  ],

  // Somatic body cue prompt templates
  somatic_body_cue_prompt: [
    {
      id: "somatic_body_cue_prompt_1",
      template:
        "Taking a moment to pause... if you're comfortable, you might notice where you feel that {feeling_name} in your body right now. No need to answer - this is just for your awareness.",
      parameters: [
        {
          name: "feeling_name",
          required: true,
          defaultValue: "feeling",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}' and the emotional valence (v:{valence}, a:{arousal}), identify a single feeling word that best captures their emotional state. Respond with just the feeling word.",
        },
      ],
    },
    {
      id: "somatic_body_cue_prompt_2",
      template:
        "As we discuss {topic}, you might take a breath and notice any physical sensations that arise. Where in your body do you feel your response to this? Just noticing is enough.",
      parameters: [
        {
          name: "topic",
          required: true,
          defaultValue: "this",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the main topic they're discussing. Respond with just the topic, using no more than 3-4 words.",
        },
      ],
    },
  ],

  // Somatic response acknowledgment templates
  somatic_response_ack: [
    {
      id: "somatic_response_ack_1",
      template: "Thank you for sharing that observation. Noticing our body's responses can provide valuable insights.",
      parameters: [],
    },
    {
      id: "somatic_response_ack_2",
      template: "I appreciate you tuning into your physical experience. That awareness can be quite helpful.",
      parameters: [],
    },
    {
      id: "somatic_response_ack_3",
      template: "Thank you for noticing that. The body often carries wisdom about our experiences.",
      parameters: [],
    },
  ],

  // Felt coherence check-in templates
  felt_coherence_checkin: [
    {
      id: "felt_coherence_checkin_1",
      template: "I'd like to check in quickly - how well did my last response capture what you were conveying?",
      parameters: [],
    },
    {
      id: "felt_coherence_checkin_2",
      template: "Just checking - did my previous response resonate with what you meant to express?",
      parameters: [],
    },
  ],

  // Distress consent check-in templates
  distress_consent_checkin: [
    {
      id: "distress_consent_checkin_1",
      template:
        "It sounds like things are very intense right now{topic_reference}. Before we continue exploring, would you prefer to temporarily pause data contributions for this session?",
      parameters: [
        {
          name: "topic_reference",
          required: false,
          defaultValue: "",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the topic causing distress. If clear, respond with ' with [topic]'. If unclear, respond with an empty string.",
        },
      ],
    },
    {
      id: "distress_consent_checkin_2",
      template:
        "I notice this conversation has touched on some difficult feelings{topic_reference}. Would you like to temporarily pause data contributions for this session?",
      parameters: [
        {
          name: "topic_reference",
          required: false,
          defaultValue: "",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', identify the topic causing distress. If clear, respond with ' around [topic]'. If unclear, respond with an empty string.",
        },
      ],
    },
    {
      id: "distress_consent_checkin_3",
      template:
        "I notice we're discussing some challenging topics. Would you like to temporarily pause data contributions while we continue this conversation?",
      parameters: [],
    },
  ],

  // Generic safe response templates
  generic_safe_response: [
    {
      id: "generic_safe_response_1",
      template: "I understand this is complex. Let's perhaps shift focus slightly.",
      parameters: [],
    },
    {
      id: "generic_safe_response_2",
      template:
        "I appreciate you sharing that with me. Let's take a moment to consider what might be most helpful now.",
      parameters: [],
    },
    {
      id: "generic_safe_response_3",
      template: "Thank you for expressing that. I'm here to support our conversation in whatever way feels right.",
      parameters: [],
    },
  ],

  // Bootstrap self-map prompt templates
  bootstrap_self_map_prompt: [
    {
      id: "bootstrap_self_map_prompt_1",
      template:
        "To help me understand what matters most to you, could you share one or two core values or important goals that guide you in life? You can also skip this if you prefer.",
      parameters: [],
    },
    {
      id: "bootstrap_self_map_prompt_2",
      template:
        "I'd like to understand what's important to you. Would you be willing to share a few values or goals that are meaningful in your life? Feel free to skip if you'd rather not share.",
      parameters: [],
    },
    {
      id: "bootstrap_self_map_prompt_3",
      template:
        "To better understand your perspective, could you share a few values or principles that are important to you? This helps me provide more relevant responses. (You can type 'skip' if you prefer not to share.)",
      parameters: [],
    },
  ],

  // Bootstrap acknowledgment templates
  bootstrap_acknowledgment: [
    {
      id: "bootstrap_acknowledgment_1",
      template: "Thank you for sharing that with me. I appreciate learning about what matters to you.",
      parameters: [],
    },
    {
      id: "bootstrap_acknowledgment_2",
      template: "I appreciate you sharing those values with me. This helps me understand your perspective better.",
      parameters: [],
    },
    {
      id: "bootstrap_acknowledgment_skip",
      template: "No problem. We can always revisit this later if you'd like.",
      parameters: [],
    },
  ],

  // Add a new intent for acknowledging emotional states
  emotional_acknowledgment: [
    {
      id: "emotional_acknowledgment_1",
      template:
        "I can sense that you're feeling {emotion_word} right now. That's a completely valid response to {situation_context}.",
      parameters: [
        {
          name: "emotion_word",
          required: true,
          defaultValue: "strongly",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}' and the emotional valence (v:{valence}, a:{arousal}), identify a single emotion word that best captures their emotional state. Respond with just the emotion word.",
        },
        {
          name: "situation_context",
          required: true,
          defaultValue: "what you're experiencing",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', briefly describe the situation or context they're responding to in 3-5 words. Be general rather than specific if unclear.",
        },
      ],
    },
    {
      id: "emotional_acknowledgment_2",
      template:
        "It makes sense that you'd feel {emotion_word} about this. Many people would respond similarly to {situation_context}.",
      parameters: [
        {
          name: "emotion_word",
          required: true,
          defaultValue: "strongly",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}' and the emotional valence (v:{valence}, a:{arousal}), identify a single emotion word that best captures their emotional state. Respond with just the emotion word.",
        },
        {
          name: "situation_context",
          required: true,
          defaultValue: "this situation",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}', briefly describe the situation or context they're responding to in 3-5 words. Be general rather than specific if unclear.",
        },
      ],
    },
  ],

  // Add a new intent for grounding exercises
  grounding_prompt: [
    {
      id: "grounding_prompt_1",
      template:
        "If it feels helpful, you might take a moment to notice {sense_focus}. This can help create a sense of being present in the moment.",
      parameters: [
        {
          name: "sense_focus",
          required: true,
          defaultValue: "your surroundings",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}' and the emotional arousal level (a:{arousal}), suggest a simple grounding focus. For high arousal (>0.7), suggest something physical like 'the sensation of your feet on the floor'. For medium arousal (0.4-0.7), suggest something visual like 'three things you can see around you'. For lower arousal (<0.4), suggest something broader like 'the sounds in your environment'. Respond with just the grounding focus phrase.",
        },
      ],
    },
    {
      id: "grounding_prompt_2",
      template:
        "Sometimes it can be helpful to gently bring awareness to {sense_focus} as we continue our conversation. Just a gentle suggestion.",
      parameters: [
        {
          name: "sense_focus",
          required: true,
          defaultValue: "your breath",
          useLlmAssistance: true,
          llmPrompt:
            "Based on the user's message '{user_message}' and the emotional arousal level (a:{arousal}), suggest a simple grounding focus. For high arousal (>0.7), suggest something physical like 'the sensation of your feet on the floor'. For medium arousal (0.4-0.7), suggest something visual like 'three things you can see around you'. For lower arousal (<0.4), suggest something broader like 'the sounds in your environment'. Respond with just the grounding focus phrase.",
        },
      ],
    },
  ],
}

/**
 * Get a random template for the given intent
 * @param intentKey The intent key
 * @returns A random template for the intent, or undefined if none exists
 */
export function getRandomTemplate(intentKey: string): ResponseTemplate | undefined {
  const intentTemplates = templates[intentKey]
  if (!intentTemplates || intentTemplates.length === 0) {
    return undefined
  }

  const randomIndex = Math.floor(Math.random() * intentTemplates.length)
  return intentTemplates[randomIndex]
}

/**
 * Get a specific template by ID
 * @param templateId The template ID
 * @returns The template with the given ID, or undefined if none exists
 */
export function getTemplateById(templateId: string): ResponseTemplate | undefined {
  for (const intentKey in templates) {
    const intentTemplates = templates[intentKey]
    const template = intentTemplates.find((t) => t.id === templateId)
    if (template) {
      return template
    }
  }
  return undefined
}

/**
 * Get all templates for the given intent
 * @param intentKey The intent key
 * @returns All templates for the intent, or an empty array if none exist
 */
export function getTemplatesForIntent(intentKey: string): ResponseTemplate[] {
  return templates[intentKey] || []
}
