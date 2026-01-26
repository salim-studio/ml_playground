// ML Playground Application
class MLPlayground {
    constructor() {
        this.currentLanguage = 'en';
        this.currentTheme = 'light';
        this.dataset = null;
        this.columns = [];
        this.charts = {};
        this.uploadedImages = [];
        this.imageGroups = {}; // Store images by group name
        this.trainedModel = null; // Store trained model info
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupLanguage();
        this.initializeFileUpload();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Language toggle
        document.getElementById('language-toggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Model training buttons
        document.getElementById('train-regression').addEventListener('click', () => {
            this.trainRegressionModel();
        });

        document.getElementById('train-classification').addEventListener('click', () => {
            this.trainClassificationModel();
        });

        document.getElementById('train-clustering').addEventListener('click', () => {
            this.trainClusteringModel();
        });

        document.getElementById('train-timeseries').addEventListener('click', () => {
            this.trainTimeSeriesModel();
        });

        document.getElementById('train-cv').addEventListener('click', () => {
            this.trainComputerVisionModel();
        });

        // Algorithm change handlers
        document.getElementById('regression-algorithm').addEventListener('change', (e) => {
            this.handleRegressionAlgorithmChange(e.target.value);
        });

        document.getElementById('classification-algorithm').addEventListener('change', (e) => {
            this.handleClassificationAlgorithmChange(e.target.value);
        });

        document.getElementById('clustering-algorithm').addEventListener('change', (e) => {
            this.handleClusteringAlgorithmChange(e.target.value);
        });

        // Train/test split slider
        document.getElementById('train-split').addEventListener('input', (e) => {
            document.getElementById('split-value').textContent = e.target.value + '%';
        });

        // Computer Vision group management
        document.getElementById('add-group-btn').addEventListener('click', () => {
            this.addImageGroup();
        });

        document.getElementById('group-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addImageGroup();
            }
        });

        // Prediction image upload
        document.getElementById('prediction-image-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handlePredictionImageUpload(e.target.files[0]);
            }
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('ml-playground-theme') || 'light';
        this.currentTheme = savedTheme;
        this.applyTheme();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('ml-playground-theme', this.currentTheme);
    }

    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    setupLanguage() {
        const savedLanguage = localStorage.getItem('ml-playground-language') || 'en';
        this.currentLanguage = savedLanguage;
        this.applyLanguage();
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.applyLanguage();
        localStorage.setItem('ml-playground-language', this.currentLanguage);
    }

    applyLanguage() {
        const elements = document.querySelectorAll(`[data-${this.currentLanguage}]`);
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Apply RTL for Arabic
        if (this.currentLanguage === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('lang-ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('lang-ar');
        }

        // Update select options
        this.updateSelectOptions();
    }

    updateSelectOptions() {
        const selects = document.querySelectorAll('select option[data-en][data-ar]');
        selects.forEach(option => {
            const text = option.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                option.textContent = text;
            }
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionId).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(link => {
            link.classList.add('active');
        });

        // Hide mobile menu
        document.getElementById('mobile-menu').classList.add('hidden');
    }

    initializeFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    async handleFileUpload(file) {
        try {
            this.showUploadStatus('loading');
            
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (fileExtension === 'csv') {
                await this.parseCSVFile(file);
            } else if (fileExtension === 'xlsx') {
                await this.parseXLSXFile(file);
            } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
                await this.handleImageUpload(file);
            } else {
                throw new Error('Unsupported file format. Please upload .csv, .xlsx, or image files.');
            }

            this.showUploadStatus('success');
            if (this.dataset) {
                this.displayDatasetPreview();
                this.populateColumnSelectors();
            }
            if (this.uploadedImages.length > 0) {
                this.displayImageGallery();
                this.enableComputerVisionButton();
            }
            this.enableModelButtons();

        } catch (error) {
            this.showUploadStatus('error', error.message);
        }
    }

    parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error('Error parsing CSV file'));
                        return;
                    }
                    
                    this.dataset = results.data;
                    this.columns = this.dataset[0];
                    this.dataset = this.dataset.slice(1); // Remove header row
                    resolve();
                },
                header: false,
                skipEmptyLines: true,
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    async parseXLSXFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
            throw new Error('Empty dataset');
        }
        
        this.columns = jsonData[0];
        this.dataset = jsonData.slice(1);
    }

    async handleImageUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    name: file.name,
                    src: e.target.result,
                    size: file.size,
                    type: file.type
                };
                this.uploadedImages.push(imageData);
                resolve();
            };
            reader.onerror = () => {
                reject(new Error('Error reading image file'));
            };
            reader.readAsDataURL(file);
        });
    }

    showUploadStatus(status, message = '') {
        const statusEl = document.getElementById('upload-status');
        const errorEl = document.getElementById('upload-error');
        
        // Add null checks to prevent errors
        if (statusEl) {
            statusEl.classList.add('hidden');
        }
        if (errorEl) {
            errorEl.classList.add('hidden');
        }

        if (status === 'success' && statusEl) {
            statusEl.classList.remove('hidden');
        } else if (status === 'error' && errorEl) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            errorEl.classList.remove('hidden');
        }
    }

    displayDatasetPreview() {
        const previewDiv = document.getElementById('dataset-preview');
        const table = document.getElementById('data-table');
        const infoDiv = document.getElementById('dataset-info');

        // Create table header
        const thead = table.querySelector('thead');
        thead.innerHTML = '';
        const headerRow = document.createElement('tr');
        this.columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table body (show first 10 rows)
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        const previewRows = this.dataset.slice(0, 10);
        
        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Dataset info
        infoDiv.innerHTML = `
            <p><strong>${this.currentLanguage === 'ar' ? 'الصفوف' : 'Rows'}:</strong> ${this.dataset.length}</p>
            <p><strong>${this.currentLanguage === 'ar' ? 'الأعمدة' : 'Columns'}:</strong> ${this.columns.length}</p>
            <p><strong>${this.currentLanguage === 'ar' ? 'عرض' : 'Showing'}:</strong> ${Math.min(10, this.dataset.length)} ${this.currentLanguage === 'ar' ? 'من' : 'of'} ${this.dataset.length} ${this.currentLanguage === 'ar' ? 'صف' : 'rows'}</p>
        `;

        previewDiv.classList.remove('hidden');
        previewDiv.classList.add('fade-in');
    }

    populateColumnSelectors() {
        // Regression selectors
        this.populateSelector('regression-target', this.columns);
        this.populateFeatureCheckboxes('regression-features', this.columns);

        // Classification selectors
        this.populateSelector('classification-target', this.columns);
        this.populateFeatureCheckboxes('classification-features', this.columns);

        // Clustering features
        this.populateFeatureCheckboxes('clustering-features', this.columns);

        // Time series selectors
        this.populateSelector('timeseries-date', this.columns);
        this.populateSelector('timeseries-value', this.columns);
    }

    populateSelector(selectorId, options) {
        const selector = document.getElementById(selectorId);
        // Keep the first option (placeholder)
        const firstOption = selector.querySelector('option');
        selector.innerHTML = '';
        selector.appendChild(firstOption);

        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            selector.appendChild(optionEl);
        });
    }

    populateFeatureCheckboxes(containerId, options) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        options.forEach(option => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${containerId}-${option}`;
            checkbox.value = option;
            checkbox.className = 'mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500';

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = option;
            label.className = 'text-sm text-gray-700 dark:text-gray-300';

            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    enableModelButtons() {
        document.getElementById('train-regression').disabled = false;
        document.getElementById('train-classification').disabled = false;
        document.getElementById('train-clustering').disabled = false;
        document.getElementById('train-timeseries').disabled = false;
    }

    handleRegressionAlgorithmChange(algorithm) {
        const polynomialDegree = document.getElementById('polynomial-degree');
        const regularizationAlpha = document.getElementById('regularization-alpha');

        // Hide all algorithm-specific options
        polynomialDegree.classList.add('hidden');
        regularizationAlpha.classList.add('hidden');

        // Show relevant options
        if (algorithm === 'polynomial') {
            polynomialDegree.classList.remove('hidden');
        } else if (algorithm === 'ridge' || algorithm === 'lasso') {
            regularizationAlpha.classList.remove('hidden');
        }
    }

    handleClassificationAlgorithmChange(algorithm) {
        const knnNeighbors = document.getElementById('knn-neighbors');
        const svmKernel = document.getElementById('svm-kernel');

        // Hide all algorithm-specific options
        knnNeighbors.classList.add('hidden');
        svmKernel.classList.add('hidden');

        // Show relevant options
        if (algorithm === 'knn') {
            knnNeighbors.classList.remove('hidden');
        } else if (algorithm === 'svm') {
            svmKernel.classList.remove('hidden');
        }
    }

    handleClusteringAlgorithmChange(algorithm) {
        const kmeansClusters = document.getElementById('kmeans-clusters');
        const dbscanParams = document.getElementById('dbscan-params');

        if (algorithm === 'kmeans') {
            kmeansClusters.classList.remove('hidden');
            dbscanParams.classList.add('hidden');
        } else if (algorithm === 'dbscan') {
            kmeansClusters.classList.add('hidden');
            dbscanParams.classList.remove('hidden');
        }
    }

    trainRegressionModel() {
        const algorithm = document.getElementById('regression-algorithm').value;
        const target = document.getElementById('regression-target').value;
        const features = this.getSelectedFeatures('regression-features');

        if (!target) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار المتغير التابع' : 'Please select a target variable');
            return;
        }

        if (features.length === 0) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار متغيرات الميزة' : 'Please select feature variables');
            return;
        }

        // Simulate model training
        this.simulateTraining('regression').then(() => {
            this.showRegressionResults();
        });
    }

    trainClassificationModel() {
        const algorithm = document.getElementById('classification-algorithm').value;
        const target = document.getElementById('classification-target').value;
        const features = this.getSelectedFeatures('classification-features');

        if (!target) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار المتغير التابع' : 'Please select a target variable');
            return;
        }

        if (features.length === 0) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار متغيرات الميزة' : 'Please select feature variables');
            return;
        }

        this.simulateTraining('classification').then(() => {
            this.showClassificationResults();
        });
    }

    trainClusteringModel() {
        const algorithm = document.getElementById('clustering-algorithm').value;
        const features = this.getSelectedFeatures('clustering-features');

        if (features.length === 0) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار متغيرات الميزة' : 'Please select feature variables');
            return;
        }

        this.simulateTraining('clustering').then(() => {
            this.showClusteringResults();
        });
    }

    trainTimeSeriesModel() {
        const algorithm = document.getElementById('timeseries-algorithm').value;
        const dateColumn = document.getElementById('timeseries-date').value;
        const valueColumn = document.getElementById('timeseries-value').value;

        if (!dateColumn || !valueColumn) {
            alert(this.currentLanguage === 'ar' ? 'يرجى اختيار أعمدة التاريخ والقيمة' : 'Please select date and value columns');
            return;
        }

        this.simulateTraining('timeseries').then(() => {
            this.showTimeSeriesResults();
        });
    }

    trainComputerVisionModel() {
        const groupCount = Object.keys(this.imageGroups).length;
        const totalImages = Object.values(this.imageGroups).reduce((sum, group) => sum + group.length, 0);

        if (groupCount < 2) {
            alert(this.currentLanguage === 'ar' ? 'يجب أن يكون لديك مجموعتان على الأقل' : 'You need at least 2 groups');
            return;
        }

        if (totalImages < 10) {
            alert(this.currentLanguage === 'ar' ? 'يجب أن يكون لديك 10 صور على الأقل' : 'You need at least 10 images total');
            return;
        }

        // Store model info for prediction
        this.trainedModel = {
            groups: Object.keys(this.imageGroups),
            architecture: document.getElementById('cv-model').value,
            epochs: document.getElementById('cv-epochs').value,
            learningRate: document.getElementById('cv-learning-rate').value
        };

        this.simulateTraining('cv').then(() => {
            this.showComputerVisionResults();
        });
    }

    getSelectedFeatures(containerId) {
        const container = document.getElementById(containerId);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    async simulateTraining(modelType) {
        const button = document.getElementById(`train-${modelType}`);
        const originalText = button.innerHTML;
        
        button.disabled = true;
        button.innerHTML = `<div class="spinner mr-2"></div>${this.currentLanguage === 'ar' ? 'جاري التدريب...' : 'Training...'}`;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        button.disabled = false;
        button.innerHTML = originalText;
    }

    showRegressionResults() {
        const resultsDiv = document.getElementById('regression-results');
        const placeholderDiv = document.getElementById('regression-placeholder');

        // Generate mock results
        const r2Score = (0.75 + Math.random() * 0.2).toFixed(3);
        const maeScore = (Math.random() * 10).toFixed(3);
        const mseScore = (Math.random() * 50).toFixed(3);
        const rmseScore = Math.sqrt(parseFloat(mseScore)).toFixed(3);

        document.getElementById('r2-score').textContent = r2Score;
        document.getElementById('mae-score').textContent = maeScore;
        document.getElementById('mse-score').textContent = mseScore;
        document.getElementById('rmse-score').textContent = rmseScore;

        placeholderDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('fade-in');

        this.createRegressionChart();
        
        // Show popup modal with enlarged results
        this.showResultsModal('regression', {
            'R² Score': r2Score,
            'MAE': maeScore,
            'MSE': mseScore,
            'RMSE': rmseScore
        });
    }

    showClassificationResults() {
        const resultsDiv = document.getElementById('classification-results');
        const placeholderDiv = document.getElementById('classification-placeholder');

        // Generate mock results
        const accuracy = (0.80 + Math.random() * 0.15).toFixed(3);
        const precision = (0.75 + Math.random() * 0.20).toFixed(3);
        const recall = (0.70 + Math.random() * 0.25).toFixed(3);
        const f1 = (2 * precision * recall / (parseFloat(precision) + parseFloat(recall))).toFixed(3);

        document.getElementById('accuracy-score').textContent = accuracy;
        document.getElementById('precision-score').textContent = precision;
        document.getElementById('recall-score').textContent = recall;
        document.getElementById('f1-score').textContent = f1;

        placeholderDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('fade-in');

        this.createClassificationChart();
        
        // Show popup modal with enlarged results
        this.showResultsModal('classification', {
            'Accuracy': accuracy,
            'Precision': precision,
            'Recall': recall,
            'F1-Score': f1
        });
    }

    showClusteringResults() {
        const resultsDiv = document.getElementById('clustering-results');
        const placeholderDiv = document.getElementById('clustering-placeholder');

        // Generate mock results
        const silhouetteScore = (0.3 + Math.random() * 0.4).toFixed(3);
        const clustersFound = Math.floor(2 + Math.random() * 6);

        document.getElementById('silhouette-score').textContent = silhouetteScore;
        document.getElementById('clusters-found').textContent = clustersFound;

        placeholderDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('fade-in');

        this.createClusteringChart();
        
        // Show popup modal with enlarged results
        this.showResultsModal('clustering', {
            'Silhouette Score': silhouetteScore,
            'Clusters Found': clustersFound
        });
    }

    showTimeSeriesResults() {
        const resultsDiv = document.getElementById('timeseries-results');
        const placeholderDiv = document.getElementById('timeseries-placeholder');

        // Generate mock results
        const maeScore = (Math.random() * 15).toFixed(3);
        const mapeScore = (Math.random() * 20).toFixed(1) + '%';

        document.getElementById('ts-mae-score').textContent = maeScore;
        document.getElementById('mape-score').textContent = mapeScore;

        placeholderDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('fade-in');

        this.createTimeSeriesChart();
        
        // Show popup modal with enlarged results
        this.showResultsModal('timeseries', {
            'MAE': maeScore,
            'MAPE': mapeScore
        });
    }

    showComputerVisionResults() {
        const resultsDiv = document.getElementById('cv-results');
        const placeholderDiv = document.getElementById('cv-placeholder');

        // Generate mock results based on training data
        const trainAccuracy = (0.85 + Math.random() * 0.10).toFixed(3);
        const valAccuracy = (0.80 + Math.random() * 0.08).toFixed(3);

        document.getElementById('cv-train-accuracy').textContent = trainAccuracy;
        document.getElementById('cv-val-accuracy').textContent = valAccuracy;

        placeholderDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('fade-in');

        this.createComputerVisionChart();
        
        // Show popup modal with enlarged results
        this.showResultsModal('computer-vision', {
            'Training Accuracy': trainAccuracy,
            'Validation Accuracy': valAccuracy,
            'Groups Trained': Object.keys(this.imageGroups).length,
            'Total Images': Object.values(this.imageGroups).reduce((sum, group) => sum + group.length, 0)
        });
    }

    createRegressionChart() {
        const ctx = document.getElementById('regression-chart').getContext('2d');
        
        if (this.charts.regression) {
            this.charts.regression.destroy();
        }

        // Generate mock data for scatter plot
        const data = [];
        for (let i = 0; i < 50; i++) {
            const actual = Math.random() * 100;
            const predicted = actual + (Math.random() - 0.5) * 20;
            data.push({ x: actual, y: predicted });
        }

        this.charts.regression = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'القيم الفعلية مقابل المتوقعة' : 'Actual vs Predicted',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2
                }, {
                    label: this.currentLanguage === 'ar' ? 'الخط المثالي' : 'Perfect Line',
                    data: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
                    type: 'line',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'القيم الفعلية' : 'Actual Values'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'القيم المتوقعة' : 'Predicted Values'
                        }
                    }
                }
            }
        });
    }

    createClassificationChart() {
        const ctx = document.getElementById('classification-chart').getContext('2d');
        
        if (this.charts.classification) {
            this.charts.classification.destroy();
        }

        // Generate mock confusion matrix data
        const classes = ['Class A', 'Class B', 'Class C'];
        const data = [
            [45, 3, 2],
            [5, 42, 3],
            [2, 4, 44]
        ];

        this.charts.classification = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: classes,
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'التصنيف الصحيح' : 'Correct Classification',
                    data: [45, 42, 44],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }, {
                    label: this.currentLanguage === 'ar' ? 'التصنيف الخاطئ' : 'Misclassification',
                    data: [5, 8, 6],
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'عدد العينات' : 'Number of Samples'
                        }
                    }
                }
            }
        });
    }

    createClusteringChart() {
        const ctx = document.getElementById('clustering-chart').getContext('2d');
        
        if (this.charts.clustering) {
            this.charts.clustering.destroy();
        }

        // Generate mock clustering data
        const clusters = [
            { data: [], color: 'rgba(59, 130, 246, 0.6)' },
            { data: [], color: 'rgba(16, 185, 129, 0.6)' },
            { data: [], color: 'rgba(239, 68, 68, 0.6)' }
        ];

        // Generate points for each cluster
        clusters.forEach((cluster, index) => {
            const centerX = (index + 1) * 30;
            const centerY = (index + 1) * 30;
            
            for (let i = 0; i < 20; i++) {
                cluster.data.push({
                    x: centerX + (Math.random() - 0.5) * 20,
                    y: centerY + (Math.random() - 0.5) * 20
                });
            }
        });

        const datasets = clusters.map((cluster, index) => ({
            label: `${this.currentLanguage === 'ar' ? 'التجمع' : 'Cluster'} ${index + 1}`,
            data: cluster.data,
            backgroundColor: cluster.color,
            borderColor: cluster.color.replace('0.6', '1'),
            borderWidth: 1
        }));

        this.charts.clustering = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'الميزة 1' : 'Feature 1'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'الميزة 2' : 'Feature 2'
                        }
                    }
                }
            }
        });
    }

    createTimeSeriesChart() {
        const ctx = document.getElementById('timeseries-chart').getContext('2d');
        
        if (this.charts.timeseries) {
            this.charts.timeseries.destroy();
        }

        // Generate mock time series data
        const labels = [];
        const historicalData = [];
        const forecastData = [];

        // Historical data (30 days)
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (30 - i));
            labels.push(date.toLocaleDateString());
            
            const value = 100 + Math.sin(i * 0.2) * 20 + Math.random() * 10;
            historicalData.push(value);
        }

        // Forecast data (7 days)
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            labels.push(date.toLocaleDateString());
            
            const value = historicalData[historicalData.length - 1] + (Math.random() - 0.5) * 5;
            forecastData.push(value);
        }

        this.charts.timeseries = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'البيانات التاريخية' : 'Historical Data',
                    data: [...historicalData, ...Array(7).fill(null)],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true
                }, {
                    label: this.currentLanguage === 'ar' ? 'التنبؤ' : 'Forecast',
                    data: [...Array(30).fill(null), ...forecastData],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'التاريخ' : 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'القيمة' : 'Value'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    createComputerVisionChart() {
        const ctx = document.getElementById('cv-chart').getContext('2d');
        
        if (this.charts.cv) {
            this.charts.cv.destroy();
        }

        // Generate mock training history data based on epochs
        const epochs = parseInt(document.getElementById('cv-epochs').value);
        const epochsArray = Array.from({length: epochs}, (_, i) => i + 1);
        
        // Simulate training progression
        const trainAcc = epochsArray.map(e => {
            const progress = e / epochs;
            return Math.min(0.95, 0.5 + (progress * 0.4) + Math.random() * 0.05);
        });
        
        const valAcc = epochsArray.map(e => {
            const progress = e / epochs;
            return Math.min(0.88, 0.45 + (progress * 0.35) + Math.random() * 0.05);
        });

        this.charts.cv = new Chart(ctx, {
            type: 'line',
            data: {
                labels: epochsArray,
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'دقة التدريب' : 'Training Accuracy',
                    data: trainAcc,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: this.currentLanguage === 'ar' ? 'دقة التحقق' : 'Validation Accuracy',
                    data: valAcc,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'العصر' : 'Epoch'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.currentLanguage === 'ar' ? 'الدقة' : 'Accuracy'
                        },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    }

    displayImageGallery() {
        const galleryDiv = document.getElementById('image-gallery');
        const gridDiv = document.getElementById('image-grid');
        const infoDiv = document.getElementById('image-info');

        // Clear existing images
        gridDiv.innerHTML = '';

        // Add each image to the grid
        this.uploadedImages.forEach((image, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-thumbnail';
            
            imageContainer.innerHTML = `
                <img src="${image.src}" alt="${image.name}" />
                <div class="image-overlay">
                    <i class="fas fa-search-plus text-xl"></i>
                </div>
            `;

            imageContainer.addEventListener('click', () => {
                this.showImageModal(image);
            });

            gridDiv.appendChild(imageContainer);
        });

        // Update image info
        const totalSize = this.uploadedImages.reduce((sum, img) => sum + img.size, 0);
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

        infoDiv.innerHTML = `
            <p><strong>${this.currentLanguage === 'ar' ? 'عدد الصور' : 'Images'}:</strong> ${this.uploadedImages.length}</p>
            <p><strong>${this.currentLanguage === 'ar' ? 'الحجم الإجمالي' : 'Total Size'}:</strong> ${sizeInMB} MB</p>
        `;

        galleryDiv.classList.remove('hidden');
        galleryDiv.classList.add('fade-in');
    }

    enableComputerVisionButton() {
        document.getElementById('train-cv').disabled = false;
    }

    showImageModal(image) {
        // Create a simple image modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full p-4">
                <img src="${image.src}" alt="${image.name}" class="max-w-full max-h-full object-contain rounded-lg">
                <button class="absolute top-2 right-2 text-white text-2xl hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded">
                    <p class="text-sm">${image.name}</p>
                    <p class="text-xs">${(image.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    showResultsModal(modelType, metrics) {
        const modal = document.getElementById('results-modal');
        if (!modal) {
            console.error('Results modal not found');
            return;
        }
        
        const modalTitle = document.getElementById('modal-title');
        const modalMetrics = document.getElementById('modal-metrics');

        if (!modalTitle || !modalMetrics) {
            console.error('Modal elements not found');
            return;
        }

        // Set modal title based on model type
        const titles = {
            regression: { en: 'Regression Analysis Results', ar: 'نتائج تحليل الانحدار' },
            classification: { en: 'Classification Analysis Results', ar: 'نتائج تحليل التصنيف' },
            clustering: { en: 'Clustering Analysis Results', ar: 'نتائج تحليل التجميع' },
            timeseries: { en: 'Time Series Analysis Results', ar: 'نتائج تحليل السلاسل الزمنية' },
            'computer-vision': { en: 'Computer Vision Analysis Results', ar: 'نتائج تحليل الرؤية الحاسوبية' }
        };

        modalTitle.querySelector('span').textContent = titles[modelType][this.currentLanguage];

        // Populate metrics
        modalMetrics.innerHTML = '';
        Object.entries(metrics).forEach(([key, value]) => {
            const metricCard = document.createElement('div');
            metricCard.className = 'modal-metric-card';
            metricCard.innerHTML = `
                <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">${key}</h4>
                <p class="text-3xl font-bold text-blue-600">${value}</p>
            `;
            modalMetrics.appendChild(metricCard);
        });

        // Create enlarged chart
        this.createModalChart(modelType);

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    createModalChart(modelType) {
        const ctx = document.getElementById('modal-chart').getContext('2d');
        
        if (this.charts.modal) {
            this.charts.modal.destroy();
        }

        // Copy the chart configuration from the respective model type
        const originalChart = this.charts[modelType];
        if (originalChart) {
            this.charts.modal = new Chart(ctx, {
                type: originalChart.config.type,
                data: originalChart.config.data,
                options: {
                    ...originalChart.config.options,
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    addImageGroup() {
        const input = document.getElementById('group-name-input');
        const groupName = input.value.trim();
        
        if (!groupName) {
            alert(this.currentLanguage === 'ar' ? 'يرجى إدخال اسم المجموعة' : 'Please enter a group name');
            return;
        }

        if (this.imageGroups[groupName]) {
            alert(this.currentLanguage === 'ar' ? 'المجموعة موجودة بالفعل' : 'Group already exists');
            return;
        }

        this.imageGroups[groupName] = [];
        this.renderImageGroups();
        input.value = '';
        this.updateTrainButton();
    }

    renderImageGroups() {
        const container = document.getElementById('image-groups-container');
        container.innerHTML = '';

        Object.keys(this.imageGroups).forEach(groupName => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'image-group';
            
            groupDiv.innerHTML = `
                <div class="image-group-header">
                    <span class="image-group-name">${groupName}</span>
                    <div class="flex items-center space-x-2">
                        <span class="image-group-count">${this.imageGroups[groupName].length} images</span>
                        <button onclick="mlPlayground.removeImageGroup('${groupName}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="image-group-grid">
                    ${this.imageGroups[groupName].map((image, index) => `
                        <div class="group-image-thumb">
                            <img src="${image.src}" alt="${image.name}">
                            <button onclick="mlPlayground.removeImageFromGroup('${groupName}', ${index})" class="remove-image-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                    <div class="upload-to-group-btn" onclick="mlPlayground.uploadToGroup('${groupName}')">
                        <i class="fas fa-plus"></i>
                    </div>
                </div>
                <input type="file" id="group-upload-${groupName}" accept="image/*" multiple class="hidden">
            `;

            container.appendChild(groupDiv);

            // Add event listener for file input
            document.getElementById(`group-upload-${groupName}`).addEventListener('change', (e) => {
                this.handleGroupImageUpload(groupName, e.target.files);
            });
        });
    }

    uploadToGroup(groupName) {
        document.getElementById(`group-upload-${groupName}`).click();
    }

    async handleGroupImageUpload(groupName, files) {
        for (let file of files) {
            try {
                const imageData = await this.processImageFile(file);
                this.imageGroups[groupName].push(imageData);
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
        this.renderImageGroups();
        this.updateTrainButton();
    }

    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    name: file.name,
                    src: e.target.result,
                    size: file.size,
                    type: file.type
                };
                resolve(imageData);
            };
            reader.onerror = () => {
                reject(new Error('Error reading image file'));
            };
            reader.readAsDataURL(file);
        });
    }

    removeImageGroup(groupName) {
        if (confirm(this.currentLanguage === 'ar' ? `هل تريد حذف مجموعة "${groupName}"؟` : `Remove group "${groupName}"?`)) {
            delete this.imageGroups[groupName];
            this.renderImageGroups();
            this.updateTrainButton();
        }
    }

    removeImageFromGroup(groupName, imageIndex) {
        this.imageGroups[groupName].splice(imageIndex, 1);
        this.renderImageGroups();
        this.updateTrainButton();
    }

    updateTrainButton() {
        const trainBtn = document.getElementById('train-cv');
        const groupCount = Object.keys(this.imageGroups).length;
        const hasImages = Object.values(this.imageGroups).some(group => group.length > 0);
        
        trainBtn.disabled = groupCount < 2 || !hasImages;
    }

    async handlePredictionImageUpload(file) {
        if (!this.trainedModel) {
            alert(this.currentLanguage === 'ar' ? 'يجب تدريب النموذج أولاً' : 'Please train the model first');
            return;
        }

        try {
            const imageData = await this.processImageFile(file);
            this.displayPredictionResult(imageData);
        } catch (error) {
            console.error('Error processing prediction image:', error);
        }
    }

    displayPredictionResult(imageData) {
        const previewDiv = document.getElementById('test-image-preview');
        const resultDiv = document.getElementById('prediction-result');
        const labelSpan = document.getElementById('prediction-label');
        const confidenceSpan = document.getElementById('prediction-confidence');

        // Display the image
        previewDiv.innerHTML = `
            <div class="prediction-image-preview">
                <img src="${imageData.src}" alt="Test Image">
            </div>
        `;

        // Simulate prediction (randomly select a group with confidence)
        const groups = this.trainedModel.groups;
        const predictedGroup = groups[Math.floor(Math.random() * groups.length)];
        const confidence = (0.75 + Math.random() * 0.20).toFixed(2);

        labelSpan.textContent = predictedGroup;
        confidenceSpan.textContent = `${(confidence * 100).toFixed(1)}%`;

        resultDiv.classList.remove('hidden');
    }
}

// Global functions for modal
function closeResultsModal() {
    const modal = document.getElementById('results-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function downloadResults() {
    // Simulate download functionality
    alert('Download functionality would be implemented here');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('results-modal');
    if (e.target === modal) {
        closeResultsModal();
    }
});

// Initialize the application when DOM is loaded
let mlPlayground; // Declare global variable

document.addEventListener('DOMContentLoaded', () => {
    mlPlayground = new MLPlayground(); // Assign to global variable
});