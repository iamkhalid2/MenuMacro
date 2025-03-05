document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const cameraBtn = document.getElementById('camera-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const analyzeBtn = document.getElementById('analyze-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Event Listeners
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    cameraBtn.addEventListener('click', () => {
        // Check if the device supports camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Open the camera interface
            openCamera();
        } else {
            alert('Your device or browser does not support camera access. Please upload an image instead.');
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', handleImageUpload);
    analyzeBtn.addEventListener('click', analyzeMenuImage);
    retakeBtn.addEventListener('click', resetImageUpload);

    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and content
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Functions
    function openCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                // Create video element to show camera feed
                const videoEl = document.createElement('video');
                videoEl.srcObject = stream;
                videoEl.autoplay = true;
                videoEl.style.width = '100%';
                videoEl.style.borderRadius = 'var(--border-radius)';
                
                // Create capture button
                const captureBtn = document.createElement('button');
                captureBtn.className = 'btn primary-btn';
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Photo';
                captureBtn.style.margin = '10px auto';
                captureBtn.style.display = 'block';
                
                // Create canvas for capturing the image
                const canvas = document.createElement('canvas');
                canvas.style.display = 'none';
                
                // Replace upload area with camera view
                uploadArea.innerHTML = '';
                uploadArea.appendChild(videoEl);
                uploadArea.appendChild(captureBtn);
                uploadArea.appendChild(canvas);
                
                // Capture photo when button is clicked
                captureBtn.addEventListener('click', () => {
                    // Set canvas dimensions to video dimensions
                    canvas.width = videoEl.videoWidth;
                    canvas.height = videoEl.videoHeight;
                    
                    // Draw video frame to canvas
                    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                    
                    // Convert canvas to blob and create file object
                    canvas.toBlob(blob => {
                        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                        
                        // Display preview
                        displayImagePreview(file);
                        
                        // Stop the camera stream
                        stream.getTracks().forEach(track => track.stop());
                    }, 'image/jpeg');
                });
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                alert('Could not access camera. Please check permissions or use upload option instead.');
                fileInput.click();
            });
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImagePreview(file);
        } else {
            alert('Please select a valid image file.');
        }
    }

    function displayImagePreview(file) {
        const fileReader = new FileReader();
        
        fileReader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        
        fileReader.readAsDataURL(file);
    }

    function resetImageUpload() {
        uploadArea.style.display = 'block';
        previewContainer.style.display = 'none';
        resultsSection.style.display = 'none';
        fileInput.value = '';
    }

    function analyzeMenuImage() {
        // Show loading state
        loadingSection.style.display = 'block';
        previewContainer.style.display = 'none';
        
        // Simulating API call to analyze image
        // In a real app, you would send the image to a backend service for processing
        setTimeout(() => {
            processMenuAnalysis(mockAnalysisData());
            
            loadingSection.style.display = 'none';
            resultsSection.style.display = 'block';
        }, 2000); // Simulating processing time
    }

    function processMenuAnalysis(data) {
        // Clear previous results
        document.getElementById('high-protein-list').innerHTML = '';
        document.getElementById('high-carbs-list').innerHTML = '';
        document.getElementById('high-fats-list').innerHTML = '';
        document.getElementById('balanced-list').innerHTML = '';
        document.getElementById('all-items-list').innerHTML = '';
        
        // Populate lists
        data.highProtein.forEach(item => {
            addItemToList('high-protein-list', item);
        });
        
        data.highCarbs.forEach(item => {
            addItemToList('high-carbs-list', item);
        });
        
        data.highFats.forEach(item => {
            addItemToList('high-fats-list', item);
        });
        
        data.balanced.forEach(item => {
            addItemToList('balanced-list', item);
        });
        
        data.allItems.forEach(item => {
            addItemToList('all-items-list', item);
        });
    }

    function addItemToList(listId, item) {
        const list = document.getElementById(listId);
        const listItem = document.createElement('li');
        
        listItem.innerHTML = `
            <span>${item.name}</span>
            <span class="macros">P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fats}g</span>
        `;
        
        list.appendChild(listItem);
    }

    // Mock data for demonstration purposes
    // In a real app, this would come from a backend API
    function mockAnalysisData() {
        return {
            highProtein: [
                { name: 'Grilled Chicken Breast', protein: 28, carbs: 0, fats: 3 },
                { name: 'Salmon Fillet', protein: 22, carbs: 0, fats: 13 },
                { name: 'Steak (8oz)', protein: 49, carbs: 0, fats: 18 }
            ],
            highCarbs: [
                { name: 'Spaghetti Pasta', protein: 7, carbs: 43, fats: 1 },
                { name: 'White Rice', protein: 4, carbs: 45, fats: 0 },
                { name: 'Garlic Bread', protein: 8, carbs: 36, fats: 7 }
            ],
            highFats: [
                { name: 'Avocado Salad', protein: 3, carbs: 9, fats: 15 },
                { name: 'Cheese Platter', protein: 12, carbs: 2, fats: 28 },
                { name: 'Fried Calamari', protein: 18, carbs: 15, fats: 25 }
            ],
            balanced: [
                { name: 'Quinoa Bowl', protein: 14, carbs: 39, fats: 9 },
                { name: 'Grilled Salmon with Vegetables', protein: 25, carbs: 15, fats: 12 },
                { name: 'Mediterranean Salad', protein: 10, carbs: 20, fats: 12 }
            ],
            allItems: [
                { name: 'Grilled Chicken Breast', protein: 28, carbs: 0, fats: 3 },
                { name: 'Salmon Fillet', protein: 22, carbs: 0, fats: 13 },
                { name: 'Steak (8oz)', protein: 49, carbs: 0, fats: 18 },
                { name: 'Spaghetti Pasta', protein: 7, carbs: 43, fats: 1 },
                { name: 'White Rice', protein: 4, carbs: 45, fats: 0 },
                { name: 'Garlic Bread', protein: 8, carbs: 36, fats: 7 },
                { name: 'Avocado Salad', protein: 3, carbs: 9, fats: 15 },
                { name: 'Cheese Platter', protein: 12, carbs: 2, fats: 28 },
                { name: 'Fried Calamari', protein: 18, carbs: 15, fats: 25 },
                { name: 'Quinoa Bowl', protein: 14, carbs: 39, fats: 9 },
                { name: 'Grilled Salmon with Vegetables', protein: 25, carbs: 15, fats: 12 },
                { name: 'Mediterranean Salad', protein: 10, carbs: 20, fats: 12 }
            ]
        };
    }
});