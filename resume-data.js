// Structured excerpts from Deyasini Mitra's resume, used as the retrieval
// corpus for the chatbot. Each chunk is a self-contained, factual passage —
// keep these in sync with index.html and resume.pdf if the resume changes.
const RESUME_CHUNKS = [
  {
    id: "summary",
    section: "Summary",
    text: "Deyasini Mitra is a data scientist with strong foundations in machine learning, statistical analysis, EDA, and predictive modeling. She has experience collecting, cleaning, and preprocessing large datasets, developing and evaluating ML models across structured and unstructured (multi-modal) data, and deploying production-ready AI systems. She is proficient in Python (Pandas, NumPy, Scikit-learn, PyTorch, TensorFlow) and SQL, and is a published IEEE author."
  },
  {
    id: "skills-ml",
    section: "Skills",
    text: "ML / Deep Learning skills: PyTorch, TensorFlow, Keras, Scikit-learn, XGBoost."
  },
  {
    id: "skills-architectures",
    section: "Skills",
    text: "Architectures: CNNs (ResNet50, AlexNet), Transformers, YOLOv8, RF-DETR, CNN-RNN."
  },
  {
    id: "skills-data-tooling",
    section: "Skills",
    text: "Numerical and data tooling: NumPy, SciPy, Pandas, Matplotlib, Plotly, Seaborn, ggplot2."
  },
  {
    id: "skills-model-eval",
    section: "Skills",
    text: "Model evaluation skills: comparative accuracy benchmarking, BLEU scoring, sub-group performance analysis."
  },
  {
    id: "skills-stats",
    section: "Skills",
    text: "Statistical foundations: Bayesian Networks, Probabilistic Graphical Models, Hypothesis Testing."
  },
  {
    id: "skills-languages",
    section: "Skills",
    text: "Programming languages: Python, SQL, R, JavaScript."
  },
  {
    id: "skills-devtools",
    section: "Skills",
    text: "Dev tools and deployment: Git, Jupyter, Google Colab, Streamlit, Flask."
  },
  {
    id: "exp-airoverse",
    section: "Experience",
    text: "AI Consultant (Fellowship) at DMI Airoverse in Pittsburgh, PA, February 2025 to May 2025. Collected, cleaned, and preprocessed large-scale satellite imagery datasets via the Google Earth API, running EDA to validate data quality and engineer features for downstream models. Developed and evaluated object-detection models (YOLOv8, RF-DETR) with structured benchmarking across architectures — RF-DETR reached 92% accuracy — and built an annotation and evaluation pipeline that cut manual effort by about 80%. Visualized and presented model findings to non-technical stakeholders through scored output dashboards."
  },
  {
    id: "exp-pitt",
    section: "Experience",
    text: "Client Services Analyst, Data & Workflow, at the University of Pittsburgh, Pittsburgh, PA, November 2023 to present. Designing an LLM-based candidate-ranking tool that scores student-faculty fit from unstructured inputs like CV summaries, returning structured, rationale-backed shortlists for human-gated, broker-reviewed matching. Queried, cleaned, and reconciled large operational datasets in TDX using SQL-style workflows, improving data-categorization accuracy by 90% through systematic EDA. Authored process documentation and workflow reports for cross-functional teams."
  },
  {
    id: "exp-dcb",
    section: "Experience",
    text: "Machine Learning Intern at DCB India Pvt. Ltd. in Ahmedabad, India, January 2023 to May 2023. Developed a predictive deep-learning model (ResNet50 CNN + RNN) for image captioning on unstructured image data, with EDA, feature engineering, and hyperparameter tuning, reaching 91% accuracy and a 0.89 BLEU score. Deployed the model to production via Streamlit and produced performance reports for stakeholder review."
  },
  {
    id: "proj-heart-failure",
    section: "Research & Projects",
    text: "Heart Failure Prediction — Bayesian Modeling and Sub-group Evaluation. Built a Bayesian Network model and evaluated performance across demographic sub-groups using Pandas, Scikit-learn, SciPy, and XGBoost — practice in identifying where and why a model's accuracy degrades on specific slices of data."
  },
  {
    id: "proj-courier",
    section: "Research & Projects",
    text: "Courier Management System — Role-Based Database Application. Developed a multi-user database system with role-based access controls for admin, dispatcher, courier, and client roles using MySQL, Streamlit, Pandas, and Python — practice building and debugging a full software system end-to-end, beyond notebook-level experimentation."
  },
  {
    id: "publication",
    section: "Publication",
    text: "Publication: 'Skin Cancer Detection using Convolutional Neural Networks,' by Deyasini Mitra, Drumil Patel, Manarth Bhavsar, Tanmay Sule, and Ankit Sharma. IEEE CISCT 2023. She independently designed and executed a comparative model evaluation on a 10,000-image unstructured dataset (ResNet50, AlexNet, custom CNN), reaching 92% accuracy. DOI: 10.1109/CISCT57197.2023.10351329."
  },
  {
    id: "edu-pitt",
    section: "Education",
    text: "M.S. in Intelligent Systems (Applied AI), University of Pittsburgh, Pittsburgh, PA, 2023 to 2025. GPA 3.73 out of 4.00."
  },
  {
    id: "edu-nirma",
    section: "Education",
    text: "Bachelor's degree in Instrumentation and Control Engineering, Nirma University, Ahmedabad, India, 2019 to 2023. CGPA 7.73 out of 10."
  },
  {
    id: "contact",
    section: "Contact",
    text: "Deyasini Mitra is based in Pittsburgh, PA, and is open to relocation. She is open to full-time roles in machine learning, model evaluation, and data science. She can be reached by email at deyasinimitra32@gmail.com, on LinkedIn at linkedin.com/in/deyasini-mitra-32a357200, or on GitHub at github.com/deyasini2312."
  }
];
