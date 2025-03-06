document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : window.location.origin;
    
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
    const homeBtn = document.getElementById('home-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const apiKeyNotice = document.getElementById('api-key-notice');
    const container = document.querySelector('.container');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const htmlRoot = document.documentElement;

    // App state
    let currentImageFile = null;
    let apiAvailable = false;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Initialize theme
    setTheme(currentTheme);

    // Apply initial animation to food icons in loader
    positionFoodIcons();

    // Check API availability on load
    checkApiAvailability();

    // Event Listeners with improved animations
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    cameraBtn.addEventListener('click', () => {
        // Add a pulse animation on click
        cameraBtn.classList.add('pulse-animation');
        setTimeout(() => {
            cameraBtn.classList.remove('pulse-animation');
        }, 300);

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
    analyzeBtn.addEventListener('click', () => {
        // Add a pulse animation on click
        analyzeBtn.classList.add('pulse-animation');
        setTimeout(() => {
            analyzeBtn.classList.remove('pulse-animation');
        }, 300);
        analyzeMenuImage();
    });
    
    retakeBtn.addEventListener('click', resetImageUpload);
    
    // Add home button event listener
    homeBtn.addEventListener('click', resetToHome);

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Tab navigation with smooth transitions
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.opacity = 0;
            });
            
            // Add active class to current tab and content
            btn.classList.add('active');
            const activeContent = document.getElementById(target);
            activeContent.classList.add('active');
            
            // Fade in the active content
            setTimeout(() => {
                activeContent.style.opacity = 1;
            }, 50);
        });
    });

    // Functions
    function setTheme(theme) {
        htmlRoot.setAttribute('data-theme', theme);
        
        // Update icon based on theme
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    function toggleTheme() {
        // Add spin animation
        themeToggle.classList.add('pulse-animation');
        setTimeout(() => {
            themeToggle.classList.remove('pulse-animation');
        }, 300);
        
        // Toggle theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Apply transition effect to body
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    }

    function positionFoodIcons() {
        const foodIcons = document.querySelectorAll('.food-icon');
        foodIcons.forEach((icon, index) => {
            // Position each food icon at a different angle around the circle
            const angle = (index / foodIcons.length) * 2 * Math.PI;
            const centerX = 60;
            const centerY = 60;
            const radius = 50;
            
            // Calculate the x and y position
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            icon.style.left = `${x}px`;
            icon.style.top = `${y}px`;
        });
    }

    function resetToHome() {
        // Add animation to home button
        homeBtn.classList.add('pulse-animation');
        setTimeout(() => {
            homeBtn.classList.remove('pulse-animation');
        }, 300);
        
        // Fade out results section
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'scale(0.95)';
        resultsSection.style.transition = 'all 0.4s ease';
        
        // After fade out, show upload area
        setTimeout(() => {
            resultsSection.style.display = 'none';
            uploadArea.style.display = 'block';
            
            // Reset upload area and animate it
            uploadArea.style.opacity = '0';
            uploadArea.style.transform = 'translateY(-20px)';
            uploadArea.style.transition = 'all 0.4s ease';
            
            setTimeout(() => {
                uploadArea.style.opacity = '1';
                uploadArea.style.transform = 'translateY(0)';
            }, 50);
            
            // Reset state
            fileInput.value = '';
            currentImageFile = null;
        }, 400);
    }

    async function checkApiAvailability() {
        try {
            const response = await fetch(`${API_URL}/health`, { 
                method: 'GET',
                timeout: 5000 // 5 second timeout
            });
            
            const data = await response.json();
            if (response.ok && data.status === 'ok') {
                apiAvailable = true;
                apiKeyNotice.style.display = 'none';
            } else {
                console.warn('API status:', data.message);
                showApiNotice();
            }
        } catch (error) {
            console.error('API health check failed:', error);
            showApiNotice();
        }
    }

    function showApiNotice() {
        apiAvailable = false;
        apiKeyNotice.style.display = 'block';
        console.warn('API not available. Demo mode will be used.');
        
        // Add animation to draw attention to the notice
        setTimeout(() => {
            apiKeyNotice.classList.add('shake-animation');
            setTimeout(() => {
                apiKeyNotice.classList.remove('shake-animation');
            }, 800);
        }, 300);
    }

    function openCamera() {
        // Configure camera to prefer the environment-facing camera (back camera) on mobile devices
        const cameraOptions = { 
            video: {
                facingMode: isMobile() ? "environment" : "user" // Use back camera on mobile, front camera on desktop
            } 
        };

        navigator.mediaDevices.getUserMedia(cameraOptions)
            .then(stream => {
                // Create video element to show camera feed
                const videoEl = document.createElement('video');
                videoEl.srcObject = stream;
                videoEl.autoplay = true;
                videoEl.style.width = '100%';
                videoEl.style.borderRadius = 'var(--border-radius)';
                videoEl.style.transform = 'scale(0.9)';
                videoEl.style.opacity = '0';
                videoEl.style.transition = 'all 0.5s ease';
                
                // Create capture button
                const captureBtn = document.createElement('button');
                captureBtn.className = 'btn primary-btn';
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Photo';
                captureBtn.style.margin = '10px auto';
                captureBtn.style.display = 'block';
                captureBtn.style.opacity = '0';
                captureBtn.style.transform = 'translateY(20px)';
                captureBtn.style.transition = 'all 0.5s ease';
                
                // Create canvas for capturing the image
                const canvas = document.createElement('canvas');
                canvas.style.display = 'none';
                
                // Replace upload area with camera view
                uploadArea.innerHTML = '';
                uploadArea.appendChild(videoEl);
                uploadArea.appendChild(captureBtn);
                uploadArea.appendChild(canvas);
                
                // Animate the camera appearance
                setTimeout(() => {
                    videoEl.style.transform = 'scale(1)';
                    videoEl.style.opacity = '1';
                    
                    setTimeout(() => {
                        captureBtn.style.opacity = '1';
                        captureBtn.style.transform = 'translateY(0)';
                    }, 300);
                }, 100);
                
                // Capture photo when button is clicked
                captureBtn.addEventListener('click', () => {
                    // Visual feedback for button click
                    captureBtn.classList.add('pulse-animation');
                    setTimeout(() => {
                        captureBtn.classList.remove('pulse-animation');
                    }, 300);
                
                    // Flash effect
                    const flash = document.createElement('div');
                    flash.style.position = 'absolute';
                    flash.style.top = '0';
                    flash.style.left = '0';
                    flash.style.right = '0';
                    flash.style.bottom = '0';
                    flash.style.backgroundColor = 'white';
                    flash.style.opacity = '0.8';
                    flash.style.zIndex = '10';
                    flash.style.pointerEvents = 'none';
                    uploadArea.appendChild(flash);
                    
                    // Fade out the flash
                    setTimeout(() => {
                        flash.style.opacity = '0';
                        flash.style.transition = 'opacity 0.5s ease';
                        
                        setTimeout(() => {
                            uploadArea.removeChild(flash);
                        }, 500);
                    }, 50);
                    
                    // Set canvas dimensions to video dimensions
                    canvas.width = videoEl.videoWidth;
                    canvas.height = videoEl.videoHeight;
                    
                    // Draw video frame to canvas
                    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                    
                    // Convert canvas to blob and create file object
                    canvas.toBlob(blob => {
                        currentImageFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                        
                        // Display preview
                        displayImagePreview(currentImageFile);
                        
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

    // Helper function to detect mobile devices
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            currentImageFile = file;
            displayImagePreview(file);
        } else {
            alert('Please select a valid image file.');
        }
    }

    function displayImagePreview(file) {
        const fileReader = new FileReader();
        
        fileReader.onload = function(e) {
            // Set the source before showing the element
            imagePreview.src = e.target.result;
            
            // Fade out upload area
            uploadArea.style.opacity = '0';
            uploadArea.style.transform = 'translateY(-20px)';
            uploadArea.style.transition = 'all 0.4s ease';
            
            // After fade out, hide upload area and show preview
            setTimeout(() => {
                uploadArea.style.display = 'none';
                previewContainer.style.display = 'block';
                
                // Start with preview hidden
                previewContainer.style.opacity = '0';
                previewContainer.style.transform = 'scale(0.95)';
                previewContainer.style.transition = 'all 0.4s ease';
                
                // Fade in preview
                setTimeout(() => {
                    previewContainer.style.opacity = '1';
                    previewContainer.style.transform = 'scale(1)';
                }, 50);
            }, 400);
        };
        
        fileReader.readAsDataURL(file);
    }

    function resetImageUpload() {
        // Fade out preview
        previewContainer.style.opacity = '0';
        previewContainer.style.transform = 'scale(0.95)';
        previewContainer.style.transition = 'all 0.4s ease';
        
        // After fade out, hide preview and show upload area
        setTimeout(() => {
            previewContainer.style.display = 'none';
            resultsSection.style.display = 'none';
            uploadArea.style.display = 'block';
            
            // Start with upload area hidden
            uploadArea.style.opacity = '0';
            uploadArea.style.transform = 'translateY(-20px)';
            uploadArea.style.transition = 'all 0.4s ease';
            
            // Fade in upload area
            setTimeout(() => {
                uploadArea.style.opacity = '1';
                uploadArea.style.transform = 'translateY(0)';
            }, 50);
            
            fileInput.value = '';
            currentImageFile = null;
        }, 400);
    }

    async function analyzeMenuImage() {
        if (!currentImageFile) {
            alert('Please capture or upload an image first.');
            return;
        }

        // Fade out preview
        previewContainer.style.opacity = '0';
        previewContainer.style.transform = 'scale(0.95)';
        previewContainer.style.transition = 'all 0.4s ease';
        
        // After fade out, hide preview and show loading
        setTimeout(() => {
            previewContainer.style.display = 'none';
            loadingSection.style.display = 'block';
            
            // Start with loading section hidden
            loadingSection.style.opacity = '0';
            loadingSection.style.transition = 'opacity 0.4s ease';
            
            // Fade in loading
            setTimeout(() => {
                loadingSection.style.opacity = '1';
                
                // Continue with the analysis
                performAnalysis();
            }, 50);
        }, 400);
        
        async function performAnalysis() {
            try {
                let analysisData;
                
                if (apiAvailable) {
                    // Create form data for image upload
                    const formData = new FormData();
                    formData.append('image', currentImageFile);
                    
                    // Send image to backend for analysis
                    const response = await fetch(`${API_URL}/analyze-menu`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to analyze menu');
                    }
                    
                    // Process the analysis result
                    analysisData = await response.json();
                } else {
                    // Use mock data if API is not available
                    console.log('Using mock data for demo purposes');
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    analysisData = mockAnalysisData();
                }
                
                // Process and display results
                processMenuAnalysis(analysisData);
                
                // Fade out loading
                loadingSection.style.opacity = '0';
                loadingSection.style.transition = 'opacity 0.4s ease';
                
                // After fade out, hide loading and show results
                setTimeout(() => {
                    loadingSection.style.display = 'none';
                    resultsSection.style.display = 'block';
                    
                    // Start with results hidden
                    resultsSection.style.opacity = '0';
                    resultsSection.style.transform = 'translateY(20px)';
                    resultsSection.style.transition = 'all 0.5s ease';
                    
                    // Fade in results
                    setTimeout(() => {
                        resultsSection.style.opacity = '1';
                        resultsSection.style.transform = 'translateY(0)';
                    }, 50);
                }, 400);
                
            } catch (error) {
                console.error('Error analyzing menu:', error);
                
                // Fade out loading
                loadingSection.style.opacity = '0';
                loadingSection.style.transition = 'opacity 0.4s ease';
                
                setTimeout(() => {
                    loadingSection.style.display = 'none';
                    
                    // Show preview again with a smooth transition
                    previewContainer.style.display = 'block';
                    previewContainer.style.opacity = '0';
                    previewContainer.style.transform = 'scale(0.95)';
                    previewContainer.style.transition = 'all 0.4s ease';
                    
                    setTimeout(() => {
                        previewContainer.style.opacity = '1';
                        previewContainer.style.transform = 'scale(1)';
                    }, 50);
                    
                    // If API failed, try mock data
                    if (apiAvailable) {
                        const tryMockData = confirm(`Error analyzing menu: ${error.message || 'Unknown error'}. Would you like to see demo results instead?`);
                        if (tryMockData) {
                            apiAvailable = false;
                            analyzeMenuImage();
                        }
                    } else {
                        alert(`Error analyzing menu: ${error.message || 'Unknown error'}`);
                    }
                }, 400);
            }
        }
    }

    function processMenuAnalysis(data) {
        // Clear previous results
        document.getElementById('high-protein-list').innerHTML = '';
        document.getElementById('high-carbs-list').innerHTML = '';
        document.getElementById('high-fats-list').innerHTML = '';
        document.getElementById('balanced-list').innerHTML = '';
        document.getElementById('all-items-list').innerHTML = '';
        
        // Set initial opacity for each category to create a staggered animation
        const categories = document.querySelectorAll('.category');
        categories.forEach((category, index) => {
            category.style.opacity = '0';
            category.style.transform = 'translateX(20px)';
            category.style.transition = 'all 0.5s ease';
            
            // Stagger the animation
            setTimeout(() => {
                category.style.opacity = '1';
                category.style.transform = 'translateX(0)';
            }, 200 * (index + 1));
        });
        
        // Populate lists with staggered animations
        if (data.highProtein && data.highProtein.length > 0) {
            data.highProtein.forEach((item, index) => {
                setTimeout(() => {
                    addItemToList('high-protein-list', item);
                }, 100 * index);
            });
        } else {
            document.getElementById('high-protein-list').innerHTML = '<li class="empty-list">No high protein items found</li>';
        }
        
        if (data.highCarbs && data.highCarbs.length > 0) {
            data.highCarbs.forEach((item, index) => {
                setTimeout(() => {
                    addItemToList('high-carbs-list', item);
                }, 100 * index);
            });
        } else {
            document.getElementById('high-carbs-list').innerHTML = '<li class="empty-list">No high carb items found</li>';
        }
        
        if (data.highFats && data.highFats.length > 0) {
            data.highFats.forEach((item, index) => {
                setTimeout(() => {
                    addItemToList('high-fats-list', item);
                }, 100 * index);
            });
        } else {
            document.getElementById('high-fats-list').innerHTML = '<li class="empty-list">No high fat items found</li>';
        }
        
        if (data.balanced && data.balanced.length > 0) {
            data.balanced.forEach((item, index) => {
                setTimeout(() => {
                    addItemToList('balanced-list', item);
                }, 100 * index);
            });
        } else {
            document.getElementById('balanced-list').innerHTML = '<li class="empty-list">No balanced items found</li>';
        }
        
        if (data.allItems && data.allItems.length > 0) {
            data.allItems.forEach((item, index) => {
                setTimeout(() => {
                    addItemToList('all-items-list', item);
                }, 50 * index);
            });
        } else {
            document.getElementById('all-items-list').innerHTML = '<li class="empty-list">No items detected</li>';
        }
    }

    function addItemToList(listId, item) {
        const list = document.getElementById(listId);
        const listItem = document.createElement('li');
        
        // Format macros with rounding to 1 decimal place
        const protein = parseFloat(item.protein).toFixed(1);
        const carbs = parseFloat(item.carbs).toFixed(1);
        const fats = parseFloat(item.fats).toFixed(1);
        
        listItem.innerHTML = `
            <span>${item.name}</span>
            <span class="macros">P: ${protein}g | C: ${carbs}g | F: ${fats}g</span>
        `;
        
        // Set initial state for animation
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateX(10px)';
        listItem.style.transition = 'all 0.3s ease';
        
        list.appendChild(listItem);
        
        // Trigger animation after a short delay to ensure the DOM has updated
        setTimeout(() => {
            listItem.style.opacity = '1';
            listItem.style.transform = 'translateX(0)';
        }, 10);
    }

    // Add CSS animation class
    function addStyleRule() {
        const style = document.createElement('style');
        style.textContent = `
            .pulse-animation {
                animation: pulse 0.3s ease-in-out;
            }
            
            .shake-animation {
                animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    addStyleRule();

    // Fallback data for testing/demo purposes
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