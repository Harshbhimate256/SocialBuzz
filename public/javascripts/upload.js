document.addEventListener('DOMContentLoaded', function () {
    // Change the image
    document.querySelector('input[name="upload-img"]').addEventListener('change', function () {
      readURL(this, document.querySelector('.file-wrapper'));
    });
  
    // Unset the image
    document.querySelector('.close-btn').addEventListener('click', function () {
      let fileInput = document.querySelector('input[name="upload-img"]');
      document.querySelector('.file-wrapper').style.backgroundImage = 'unset';
      document.querySelector('.file-wrapper').classList.remove('file-set');
  
      // Clone the file input element to reset it
      let newFileInput = fileInput.cloneNode(true);
      fileInput.parentNode.replaceChild(newFileInput, fileInput);
  
      // Reattach the change event listener to the new input element
      newFileInput.addEventListener('change', function () {
        readURL(this, document.querySelector('.file-wrapper'));
      });
    });
  
    // Function to read and display the image
    function readURL(input, obj) {
      if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
          obj.style.backgroundImage = 'url(' + e.target.result + ')';
          obj.classList.add('file-set');
        }
        reader.readAsDataURL(input.files[0]);
      }
    }
  });
  