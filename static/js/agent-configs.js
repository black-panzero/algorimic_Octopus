// Agent Configurations
window.agentConfigs = {
    'meta-orchestrator': {
        name: 'Meta Orchestrator',
        description: 'Manages system-wide coordination and research goals.',
        capabilities: [
            'System-wide coordination',
            'Research goal management',
            'Task distribution',
            'Progress monitoring'
        ],
        integration: 'Core system component that orchestrates all other agents and modules.'
    },
    'builder-supervisor': {
        name: 'Tool & Agent Builder Supervisor',
        description: 'Oversees and coordinates the development and optimization of new tools and agents.',
        capabilities: [
            'Tool development coordination',
            'Agent creation supervision',
            'Optimization management',
            'Integration testing'
        ],
        integration: 'Coordinates with Meta Orchestrator for system expansion needs.'
    },
    'system-analyst': {
        name: 'System Analyst & Designer',
        description: 'Designs new agents and tools based on requirements.',
        capabilities: [
            'System analysis',
            'Agent design',
            'Requirements engineering',
            'Architecture planning'
        ],
        integration: 'Works under Builder Supervisor to design new system components.'
    },
    'prompt-engineer': {
        name: 'Prompt Engineer',
        description: 'Crafts and optimizes prompts for LLM-powered agents.',
        capabilities: [
            'Prompt design',
            'LLM optimization',
            'Response analysis',
            'Prompt testing'
        ],
        integration: 'Collaborates with System Analyst to implement agent behaviors.'
    },
    'coder-agent': {
        name: 'Coder',
        description: 'Implements and tests new agents and tools.',
        capabilities: [
            'Code implementation',
            'Unit testing',
            'Integration testing',
            'Documentation'
        ],
        integration: 'Works with Prompt Engineer to implement designed systems.'
    },
    'literature-supervisor': {
        name: 'Literature & Novelty Supervisor',
        description: 'Coordinates literature review and research novelty assessment processes.',
        capabilities: [
            'Literature review coordination',
            'Novelty assessment',
            'Research direction guidance',
            'Knowledge synthesis'
        ],
        integration: 'Reports to Meta Orchestrator for research strategy alignment.'
    },
    'literature-agent': {
        name: 'Literature Searcher',
        description: 'Performs comprehensive literature reviews and analysis.',
        capabilities: [
            'Literature search',
            'Content analysis',
            'Data extraction',
            'Summary generation'
        ],
        integration: 'Reports to Literature Supervisor with research findings.'
    },
    'proximity-checker': {
        name: 'Proximity Checker',
        description: 'Verifies research novelty and identifies gaps.',
        capabilities: [
            'Novelty verification',
            'Gap analysis',
            'Similarity assessment',
            'Opportunity identification'
        ],
        integration: 'Works with Literature Searcher to evaluate research uniqueness.'
    },
    'hypothesis-supervisor': {
        name: 'Hypothesis Management Supervisor',
        description: 'Oversees the generation, review, ranking, and evolution of research hypotheses.',
        capabilities: [
            'Hypothesis coordination',
            'Quality control',
            'Evolution tracking',
            'Team coordination'
        ],
        integration: 'Coordinates with Literature Supervisor for hypothesis development.'
    },
    'hypothesis-agent': {
        name: 'Hypothesis Generator',
        description: 'Generates and refines research hypotheses.',
        capabilities: [
            'Hypothesis generation',
            'Pattern recognition',
            'Creative thinking',
            'Initial validation'
        ],
        integration: 'Works under Hypothesis Supervisor to create new hypotheses.'
    },
    'hypothesis-reviewer': {
        name: 'Hypothesis Reviewer',
        description: 'Reviews and validates generated hypotheses.',
        capabilities: [
            'Hypothesis validation',
            'Quality assessment',
            'Feedback generation',
            'Improvement suggestions'
        ],
        integration: 'Collaborates with Hypothesis Generator to refine hypotheses.'
    },
    'hypothesis-ranker': {
        name: 'Hypothesis Ranker',
        description: 'Prioritizes hypotheses based on potential impact.',
        capabilities: [
            'Impact assessment',
            'Priority ranking',
            'Resource allocation',
            'Risk assessment'
        ],
        integration: 'Works with Reviewer to determine hypothesis priorities.'
    },
    'hypothesis-evolver': {
        name: 'Hypothesis Evolver',
        description: 'Evolves and refines hypotheses over time.',
        capabilities: [
            'Hypothesis refinement',
            'Adaptation management',
            'Version control',
            'Progress tracking'
        ],
        integration: 'Coordinates with all hypothesis agents for continuous improvement.'
    },
    'review-supervisor': {
        name: 'Meta Review Supervisor',
        description: 'Coordinates and oversees the meta-review process of research findings.',
        capabilities: [
            'Review coordination',
            'Quality assurance',
            'Process oversight',
            'Feedback integration'
        ],
        integration: 'Reports to Meta Orchestrator on research validation.'
    },
    'meta-reviewer': {
        name: 'Meta Reviewer',
        description: 'Reviews and validates research findings.',
        capabilities: [
            'Research validation',
            'Quality control',
            'Methodology review',
            'Results verification'
        ],
        integration: 'Works under Review Supervisor to validate findings.'
    }
}; 