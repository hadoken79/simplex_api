document.addEventListener("DOMContentLoaded", event => {
    //Für Bulma Date-Picker-Objekt
    //https://creativebulma.net/product/calendar/demo

    let videoDownloads = [];

    const maxDateOptions = {
        dateFormat: 'YYYY-MM-DD',
        color: 'info'
    };

    // Alle Instanzen des Datumstyp
    const calendars = bulmaCalendar.attach('[type="date"]', maxDateOptions);

    //Alle Widgets erfassen
    calendars.forEach(calendar => {

        calendar.on('date:selected', date => {
            console.log(date);
        });
    });


    //Input für Projekterstellungsdatum max
    const element = document.querySelector('#maxDatePicker');
    if (element) {
        element.bulmaCalendar.on('select', datepicker => {
            console.log(datepicker.data.value());
            maxDate = datepicker.data.value();
        });
    }


    //Verbindung mit Websocketserver.js Port 8080 (nativ html5)
    let ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        console.log('websocket is connected ...');
        ws.send('client listening');
    }
    ws.onmessage = ev => {
        //console.log(ev.data);
        let message = JSON.parse(ev.data);
        //status der Downloads wird von simplexService via WebSockets versendet, dies muss im Gui angezeigt werden.
        if (message.type === 'dlstat') {
            updateGui(message);
        } else if (message.type === 'dlend') {
            let panel = document.getElementById('downloadStatus');
            let title = document.getElementById('dlTitle');
            panel.classList.replace('is-info', 'is-primary');
            title.textContent = ('download fertig');
        }
    }

    const updateGui = stats => {

        let panel = document.getElementById('downloadStatus');
        let progressbar = document.getElementById(stats.id);
        if (!progressbar) {
            //Container
            panelBlock = document.createElement('div');
            panelBlock.classList.add('panel-block');

            //Elemente
            icon = document.createElement('span');
            icon.classList.add('panel-icon');

            fa = document.createElement('i');
            fa.classList.add('fa', 'fa-video-camera');
            fa.setAttribute('aria-hidden', 'true');

            title = document.createElement('p');
            title.classList.add('downloadTitle');
            title.textContent = 'ID: ' + stats.id;

            sizeInfo = document.createElement('p');
            sizeInfo.classList.add('downloadTitle');
            sizeInfo.textContent = (stats.totalSize > 0) ? (((stats.totalSize / (1024 * 1024)).toFixed(0)) + 'MB') : 'unbekannt';

            progressbar = document.createElement('PROGRESS');
            progressbar.id = stats.id;
            progressbar.classList.add('progress', 'is-warning');
            progressbar.value = stats.percent;
            progressbar.max = 100;
            progressbar.textContent = stats.id;

            //Zusammensetzen
            icon.appendChild(fa);
            panelBlock.appendChild(icon);
            panelBlock.appendChild(title);
            panelBlock.appendChild(sizeInfo);
            panelBlock.appendChild(progressbar);
            panel.appendChild(panelBlock);

        }

        if (stats.detail === 'progress') {
            progressbar.value = stats.percent.toFixed(2) * 100;
        }

        if (stats.detail === 'end') {
            progressbar.value = 100;
            progressbar.classList.replace('is-warning', 'is-primary')
        }

        /*
                <div class="panel-block">

                <span class="panel-icon">
                    <i class="fa fa-video-camera" aria-hidden="true"></i>
                </span>
                <p class="downloadTitle">
                    ert
                </p>
                <p class="downloadTitle">
                    ert
                </p>

                <progress class="progress is-warning" value="75" max="100">75%</progress>
            </div>
        */
        //<progress class="progress is-warning" value="75" max="100">75%</progress>
        //{ type: 'dlstat', id: projectId, detail: 'progress', totalSize: state.size.total, percent: state.percent }
    }

});





