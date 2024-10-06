document.addEventListener('DOMContentLoaded', function() {
  const pushBtn = document.querySelector('#push');

  pushBtn.addEventListener('click', function() {
    fetch('/push', {
      method: 'POST',
    });
  });
});
