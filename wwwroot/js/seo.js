ClassicEditor.create(document.querySelector('#editor'), {
    toolbar: [
        'heading', '|', 'bold', 'italic', 'link', '|', 'imageUpload', 'undo', 'redo'
    ],
    image: {
        toolbar: ['imageTextAlternative', 'imageStyle:full', 'imageStyle:side', 'linkImage']
    },
    extraPlugins: [CustomSEOPlugin]
}).catch(error => {
    console.error(error);
});

function CustomSEOPlugin(editor) {
    // اضافه کردن پشتیبانی از alt و title
    editor.model.schema.extend('image', {
        allowAttributes: ['alt', 'title']
    });

    editor.conversion.for('upcast').attributeToAttribute({
        view: {
            name: 'img',
            key: 'alt'
        },
        model: 'alt'
    });

    editor.conversion.for('upcast').attributeToAttribute({
        view: {
            name: 'img',
            key: 'title'
        },
        model: 'title'
    });

    editor.conversion.for('downcast').attributeToAttribute({
        model: 'alt',
        view: 'alt'
    });

    editor.conversion.for('downcast').attributeToAttribute({
        model: 'title',
        view: 'title'
    });

    console.log('CustomSEOPlugin loaded!');
}
