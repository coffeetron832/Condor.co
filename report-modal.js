document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('reportModal');
    const openBtn = document.getElementById('openReportModal');
    const closeBtn = document.getElementById('closeReportModal');
    const reportForm = document.getElementById('reportForm');
    const successMsg = document.getElementById('reportSuccessMsg');
    const submitBtn = document.getElementById('submitReportBtn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.showModal();
            if (successMsg) successMsg.style.display = 'none';
            if (reportForm) {
                reportForm.style.display = 'block';
                reportForm.reset();
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Enviar reporte';
            }
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.close();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    }

    if (reportForm) {
        reportForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Enviando...';
            }

            const formData = new FormData(reportForm);

            fetch(reportForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                reportForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'block';

                setTimeout(() => {
                    if (modal) modal.close();
                }, 2000);
            })
            .catch(error => {
                alert('Hubo un error al enviar el reporte. Por favor, inténtalo de nuevo.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Enviar reporte';
                }
            });
        });
    }
});
