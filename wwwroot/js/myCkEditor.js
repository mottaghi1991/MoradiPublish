
 

        


        import {
            ClassicEditor,
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Font,
            Heading,
            Image,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageUpload,
            Link,
            List,
            ImageResize, // تغییر اندازه تصویر
            Alignment // جهت‌دهی
        } from 'ckeditor5';
ClassicEditor.create(document.querySelector('#editor'), {
    height: 300, 
    extraPlugins: [MyCustomUploadAdapterPlugin],
    licenseKey: '', // اگر مجوز نیاز دارید وارد کنید
    plugins: [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Font,
        Heading,
        Image,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageUpload,
        Link,
        List,
        ImageResize, // تغییر اندازه
        Alignment // جهت‌دهی
    ],
            toolbar: [
                'heading', '|', 'bold', 'italic', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                'link', 'bulletedList', 'numberedList', '|', 'imageUpload', '|',
                'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', // جهت‌دهی تصاویر
                'imageResize', 'imageTextAlternative', 'toggleImageCaption', '|',
                'alignment:left', 'alignment:center', 'alignment:right', 'alignment:justify' // چینش متن
            ],
    language: 'fa', // زبان فارسی
    ui: {
        language: 'fa' // تنظیم رابط کاربری به فارسی
    },
    contentLanguage: 'fa', // زبان محتوای پیش‌فرض
    alignment: {
        options: ['left', 'right', 'center', 'justify'] // تنظیم جهت‌گیری متن
    },
    image: {
        toolbar: [
            'imageTextAlternative', 'imageStyle:full', 'imageStyle:side'
        ],
        upload: {
            onUpload: (imageElement, imageSrc) => {
                imageElement.src = imageSrc; // تنظیم آدرس تصویر
            }
        }
    }
        })


            .then(editor => {
                editor.model.document.on('change:data', () => {
                    // دسترسی به محتوای ویرایشگر به صورت HTML
                    const htmlContent = editor.getData();

                    // ایجاد یک موقتی div برای پردازش HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;

                    // جستجوی تصاویر در محتوای HTML
                    const images = tempDiv.querySelectorAll('img');

                    images.forEach(image => {
                        

                        const altText = image.alt; // دریافت مقدار alt
                        const imageSrc = image.src; // دریافت آدرس تصویر (src)

                        if (altText) {
                       

                            // ارسال به سرور
                            sendAltToServer(imageSrc, altText);
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error initializing the editor:', error);
            });

        // تابع ارسال اطلاعات alt به سرور
        function sendAltToServer(imageSrc, altText) {
            console.log('Sending alt text and image to server:', altText, imageSrc);  // چاپ مقدار alt و src قبل از ارسال به سرور

            // ارسال به سرور با استفاده از AJAX
            $.ajax({
                url: '@Url.Action("SaveImageInfo", "Setting", new { area = "Admin" })', // آدرس سرور، توجه به مسیر دقیق
                method: 'POST',
                data: {
                    imageSrc: imageSrc, // آدرس تصویر
                    alt: altText       // متن alt
                },
                success: function (response) {
                    console.log('Alt text and image successfully saved on the server.');
                },
                error: function (error) {
                    console.error('Error saving alt text and image:', error);
                }
            });
        }


        class MyUploadAdapter {
            constructor(loader) {
                this.loader = loader;
            }

            // فراخوانی هنگام آپلود فایل
            upload() {
                return this.loader.file
                    .then(file => new Promise((resolve, reject) => {
                        const data = new FormData();
                        data.append('upload', file);

                        // ارسال تصویر به سرور
                        fetch('@Url.Action("UploadImage", "Setting", new { area = "Admin" })', {
                            method: 'POST',
                            body: data
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.uploaded) {
                                    // در صورت موفقیت، آدرس تصویر را برمی‌گردانید
                                    resolve({
                                        default: data.url // ارسال URL به CKEditor
                                    });
                                } else {
                                    reject('Image upload failed');
                                }
                            })
                            .catch(error => reject(error.message || 'Upload failed.'));
                    }));
            }


            // حذف فایل (اختیاری)
            abort() {
                // عملیات لغو آپلود
            }
        }


        // ادغام آداپتر آپلود سفارشی با CKEditor
        function MyCustomUploadAdapterPlugin(editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new MyUploadAdapter(loader);
            };
        }

