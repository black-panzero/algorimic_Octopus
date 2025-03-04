// Tool Configurations
window.toolConfigs = {
    'text-summarizer': {
        name: 'Text Summarizer',
        description: 'Advanced text summarization tool using state-of-the-art language models to generate concise, accurate summaries of long documents.',
        capabilities: [
            'Text Processing',
            'Summarization',
            'NLP'
        ],
        parameters: [
            {
                name: 'text',
                type: 'string',
                description: 'The text to summarize'
            },
            {
                name: 'max_length',
                type: 'integer',
                description: 'Maximum length of the summary'
            }
        ],
        integration: 'Core component of the document processing pipeline.'
    },
    'code-generator': {
        name: 'Code Generator',
        description: 'AI-powered code generation tool that creates high-quality code snippets and implementations based on natural language descriptions.',
        capabilities: [
            'Code Generation',
            'Programming',
            'AI'
        ],
        parameters: [
            {
                name: 'description',
                type: 'string',
                description: 'Natural language description of the code to generate'
            },
            {
                name: 'language',
                type: 'string',
                description: 'Target programming language'
            }
        ],
        integration: 'Used by the development and automation modules.'
    },
    'data-cleaner': {
        name: 'Data Cleaner',
        description: 'Comprehensive data cleaning and preprocessing tool that handles missing values, outliers, and data formatting issues.',
        capabilities: [
            'Data Cleaning',
            'Preprocessing',
            'Validation'
        ],
        parameters: [
            {
                name: 'data',
                type: 'object',
                description: 'The data to clean'
            },
            {
                name: 'options',
                type: 'object',
                description: 'Cleaning options and parameters'
            }
        ],
        integration: 'Essential component of the data processing pipeline.'
    },
    'data-transformer': {
        name: 'Data Transformer',
        description: 'Powerful data transformation tool that converts data between different formats and structures while maintaining data integrity.',
        capabilities: [
            'Data Transformation',
            'Format Conversion',
            'ETL'
        ],
        parameters: [
            {
                name: 'input_data',
                type: 'object',
                description: 'Data to transform'
            },
            {
                name: 'output_format',
                type: 'string',
                description: 'Target format for the transformation'
            }
        ],
        integration: 'Core component of the ETL pipeline.'
    },
    'literature-search': {
        name: 'Literature Search',
        description: 'Advanced literature search tool that helps find relevant academic papers and research documents across multiple databases.',
        capabilities: [
            'Literature Search',
            'Academic Research',
            'Database Query'
        ],
        parameters: [
            {
                name: 'query',
                type: 'string',
                description: 'Search query'
            },
            {
                name: 'databases',
                type: 'array',
                description: 'List of databases to search'
            }
        ],
        integration: 'Integrated with the research management system.'
    },
    'citation-manager': {
        name: 'Citation Manager',
        description: 'Comprehensive citation management tool that helps organize, format, and export citations in various academic styles.',
        capabilities: [
            'Citation Management',
            'Bibliography',
            'Reference Formatting'
        ],
        parameters: [
            {
                name: 'citations',
                type: 'array',
                description: 'List of citations to manage'
            },
            {
                name: 'style',
                type: 'string',
                description: 'Citation style (e.g., APA, MLA)'
            }
        ],
        integration: 'Works with the document processing and research modules.'
    },
    'statistical-analyzer': {
        name: 'Statistical Analyzer',
        description: 'Advanced statistical analysis tool that performs complex statistical tests and generates detailed reports and visualizations.',
        capabilities: [
            'Statistical Analysis',
            'Data Visualization',
            'Reporting'
        ],
        parameters: [
            {
                name: 'data',
                type: 'object',
                description: 'Data to analyze'
            },
            {
                name: 'tests',
                type: 'array',
                description: 'Statistical tests to perform'
            }
        ],
        integration: 'Core component of the analytics pipeline.'
    },
    'trend-analyzer': {
        name: 'Trend Analyzer',
        description: 'Sophisticated trend analysis tool that identifies patterns, correlations, and trends in time-series and sequential data.',
        capabilities: [
            'Trend Analysis',
            'Pattern Recognition',
            'Time Series'
        ],
        parameters: [
            {
                name: 'time_series',
                type: 'array',
                description: 'Time series data to analyze'
            },
            {
                name: 'analysis_type',
                type: 'string',
                description: 'Type of trend analysis to perform'
            }
        ],
        integration: 'Integrated with the forecasting and analytics modules.'
    }
}; 