document.addEventListener("DOMContentLoaded", event => {

    //Verbindung mit Websocketserver.js Port 8080 (nativ html5)
    let ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        console.log('websocket connected ...');
        ws.send('client listening');
    }

    ws.onmessage = ev => {
        //console.log(ev.data);
        let message = JSON.parse(ev.data);
        //status der Downloads wird von simplexService via WebSockets versendet, dies muss im Gui angezeigt werden.
        if (message.type === 'dlstat') {
            updateArchiveGui(message);
        } else if (message.type === 'dlend') {
            let panel = document.getElementById('downloadStatus');
            let title = document.getElementById('statusBar');
            panel.classList.replace('is-info', 'is-primary');
            title.innerHTML = ('download fertig');
        } else if (message.type === 'delstat') {
            updateDeleteGui(message);
        } else if (message.type == 'delend') {
            let panel = document.getElementById('deleteStatus');
            let title = document.getElementById('delStatusBar');
            panel.classList.replace('is-info', 'is-primary');
            title.innerHTML = ('Löschen fertig');
        }
    }



    //Home 
    if (document.getElementById('pag-wrapper')) {

        //initial call
        //console.log('INIT CALL')
        getProjectsFromAllChannels(null, new Date().toISOString(), 32, 0, 'desc');

        //Form
        let channelOption = document.querySelector('#channelSelector');
        let sortOption = document.querySelector('#sortingSelector');
        let searchField = document.querySelector('#searchText');

        let searchText = null;
        let channel = channelOption.value;
        let sort = sortOption.value;



        //Event Listeners
        channelOption.onchange = () => {
            //console.log('Channel ' + channelOption.value);
            getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, 0, sort, searchText);
        }

        sortOption.onchange = () => {
            //console.log('sorting ' + sortOption.value);
            getProjectsFromAllChannels(channel, new Date().toISOString(), 32, 0, sortOption.value, searchText);
        }
        searchField.onkeyup = () => {
            searchText = searchField.value;
            getProjectsFromAllChannels(channel, new Date().toISOString(), 32, 0, sortOption.value, searchText);
        }
    }

    //Archive

    //Für Bulma Date-Picker-Objekt
    //https://creativebulma.net/product/calendar/demo

    const maxDateOptions = {
        dateFormat: 'YYYY-MM-DD',
        color: 'info'
    };

    // Alle Instanzen des Datumstyp
    const calendars = bulmaCalendar.attach('[type="date"]', maxDateOptions);

    //Alle Widgets erfassen
    calendars.forEach(calendar => {

        calendar.on('date:selected', date => {
            //console.log(date);
        });
    });


    //Input für Projekterstellungsdatum max
    const element = document.querySelector('#maxDatePicker');
    if (element) {
        element.bulmaCalendar.on('select', datepicker => {
            //console.log(datepicker.data.value());
            maxDate = datepicker.data.value();
        });
    }

});

//Methods
const getProjectsFromAllChannels = (channel, maxCreationDate, size, page, sort, text = null) => {
    let failhappend; //für UpdateGui
    let url;
    if (channel) {
        if (text) {
            url = `/api/channelProjects?channel=${channel}&text=${text}&size=${size}&page=${page}&sort=${sort}`;
        } else {
            url = `/api/channelProjects?channel=${channel}&size=${size}&page=${page}&sort=${sort}`;
        }

    } else {
        if (text) {
            url = `/api/allProjects?text=${text}&maxCreateDate=${maxCreationDate}&size=${size}&page=${page}&sort=${sort}`;
        } else {
            url = `/api/allProjects?maxCreateDate=${maxCreationDate}&size=${size}&page=${page}&sort=${sort}`;
        }

    }

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            //console.log('RESPONSE ' + response.status);
            if (response.status != '200') {
                Promise.reject('Error from Simplexcall');
            } else {

                let projects = response.json();
                //console.log(projects);
                return projects;
            }
        })
        .then(projects => {
            failhappend = false;
            if (!projects.content) {
                failhappend = true;
            }
            //console.log('ANSWER FROM FETCH');
            updateHomeGui(projects, failhappend);
        })
        .catch(err => {
            failhappend = true;
            updateHomeGui(new Array, failhappend);
        })

}

const updateHomeGui = (projects, failhappend) => {

    //falls api nichts liefert


    if (failhappend) {
        showError();
        return;
    } else {
        hideError();
    }

    let head = document.querySelector('#homeheading');
    let channelOption = document.querySelector('#channelSelector');
    let channelSelection = channelOption.options[channelOption.selectedIndex].text;
    head.textContent = `Im Channel < ${channelSelection}> sind im Moment ${projects.totalElements} Projekte auf Simplex online.`;
    let sortOption = document.querySelector('#sortingSelector');
    let searchField = document.querySelector('#searchText');
    let searchText = searchField.value;



    let wrapper = document.querySelector('.columns');
    let pagWrapper = document.querySelector('#pag-wrapper');

    //alle ELemente entfernen
    while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
    }
    while (pagWrapper.firstChild) {
        pagWrapper.removeChild(pagWrapper.firstChild);
    }



    projects.content.forEach(project => {
        //Elemente erzeugen

        //Flexbox Container
        let column = document.createElement('div');
        column.classList.add('column', 'is-one-quarter');
        //link
        let link = document.createElement('a');
        link.setAttribute('href', `/details?id=${project.projectId}`);
        //Card Element
        let card = document.createElement('div');
        card.classList.add('card');
        //Bildcontainer
        let imageContainer = document.createElement('div');
        imageContainer.classList.add('card-image');
        //Das eigentliche Bild
        let imgwrapper = document.createElement('figure');
        imgwrapper.classList.add('image', 'is-16by9');
        let img = document.createElement('img');
        img.setAttribute('src', `https://media10.simplex.tv/content/4062/4063/${project.projectId}/simvid_1_med.jpg`); //Fehler bei fehlendem Bild noch abfangen
        img.setAttribute('alt', `Projekt Thumbnail`);
        //Content-Container
        let content = document.createElement('div');
        content.classList.add('card-content');
        //titel
        let titel = document.createElement('p');
        titel.classList.add('title', 'is-5', 'is-ellipsis-1', 'card-title');
        titel.textContent = project.title;
        //Beschreibungs-Container
        let descContainer = document.createElement('div');
        descContainer.classList.add('content', 'card-description', 'is-ellipsis-2');
        descContainer.textContent = project.description;
        //Card-Footer
        let footer = document.createElement('div');
        footer.classList.add('card-footer');
        //footer-item-enabled
        let enItem = document.createElement('p');
        enItem.classList.add('card-footer-item');
        //tag muss bei Bulma in noch ein span gepackt werden
        let tagWrap = document.createElement('div');
        tagWrap.classList.add('tags');
        let enTag = document.createElement('span');
        enTag.classList.add('tag');
        enTag.classList.add((project.enabled) ? ('is-success') : ('is-danger'));
        enTag.textContent = project.enabled ? 'enabled' : 'not enabled';

        let pubTag = document.createElement('span');
        pubTag.classList.add('tag');
        pubTag.classList.add((project.published) ? ('is-success') : ('is-danger'));
        pubTag.textContent = project.published ? 'publ.' : 'not publ.';
        //footer-item-createdDate
        let daItem = document.createElement('p');
        daItem.classList.add('card-footer-item');
        let daTag = document.createElement('span');
        daTag.classList.add('card-footer-date');
        //Datumselement convertieren
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        let isoDate = new Date(project.createdDate);
        let shortDate = isoDate.toLocaleDateString('de-DE', options);
        daTag.textContent = shortDate;


        //zusammensetzen
        //Footer
        daItem.appendChild(daTag);
        tagWrap.appendChild(enTag);
        tagWrap.appendChild(pubTag);
        enItem.appendChild(tagWrap);
        footer.appendChild(enItem);
        footer.appendChild(daItem);


        //Content
        content.appendChild(titel);
        content.appendChild(descContainer);


        //Image
        imgwrapper.appendChild(img);
        imageContainer.appendChild(imgwrapper);

        //Card
        card.appendChild(imageContainer);
        card.appendChild(content);
        card.appendChild(footer);

        //Container
        link.appendChild(card);
        column.appendChild(link);
        wrapper.appendChild(column);


    });


    //Pagnation
    //Elemente Erzeugen
    let pagNav = document.createElement('nav');
    pagNav.classList.add('pagination', 'is-centered');
    pagNav.setAttribute('role', 'navigation');

    let pre = document.createElement('a');
    pre.classList.add('pagination-previous');
    pre.textContent = 'Previous';

    let next = document.createElement('a');
    next.classList.add('pagination-next');
    next.textContent = 'Next';

    let ul = document.createElement('ul');
    ul.classList.add('pagination-list');

    let firstList = document.createElement('li');
    let first = document.createElement('a');
    first.classList.add('pagination-link');
    firstList.appendChild(first);

    let leftList = document.createElement('li');
    let left = document.createElement('a');
    left.classList.add('pagination-link');
    leftList.appendChild(left);

    let middleList = document.createElement('li');
    let middle = document.createElement('a');
    middle.classList.add('pagination-link');
    middleList.appendChild(middle);

    let rightList = document.createElement('li');
    let right = document.createElement('a');
    right.classList.add('pagination-link');
    rightList.appendChild(right);

    let lastList = document.createElement('li');
    let last = document.createElement('a');
    last.classList.add('pagination-link');
    lastList.appendChild(last);

    let spaceOne = document.createElement('li');
    let spaceOneSpan = document.createElement('span');
    spaceOneSpan.classList.add('pagination-ellipsis');
    spaceOneSpan.innerHTML = '&hellip;';
    spaceOne.appendChild(spaceOneSpan);

    let spaceTwo = document.createElement('li');
    let spaceTwoSpan = document.createElement('span');
    spaceTwoSpan.classList.add('pagination-ellipsis');
    spaceTwoSpan.innerHTML = '&hellip;';
    spaceTwo.appendChild(spaceTwoSpan);

    //Zusammensetzen
    ul.appendChild(firstList);
    ul.appendChild(spaceOne);
    if (projects.totalPages > 4) {
        ul.appendChild(leftList);
        ul.appendChild(middleList);
        ul.appendChild(rightList);
        ul.appendChild(spaceTwo);
    }
    ul.appendChild(lastList);
    pagNav.appendChild(pre);
    pagNav.appendChild(next);
    pagNav.appendChild(ul);
    pagWrapper.appendChild(pagNav);




    if (projects.number === 0) {

        pre.setAttribute('disabled', 'disabled');
        first.classList.add('is-current');
        left.textContent = projects.number + 2;
        middle.textContent = projects.number + 3;
        right.textContent = projects.number + 4;

    } else if ((projects.number + 1) === projects.totalPages) {

        //console.log('letzte Seite');
        next.setAttribute('disabled', 'disabled');
        left.textContent = projects.number - 2;
        middle.textContent = projects.number - 1;
        right.textContent = projects.number;
        last.classList.add('is-current');


    } else {

        left.textContent = projects.number;
        middle.textContent = projects.number + 1;
        middle.classList.add('is-current');
        right.textContent = projects.number + 2;

    }
    first.textContent = 1;
    last.textContent = projects.totalPages;

    pre.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, (projects.number - 1), sortOption.value), searchText);
    next.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, (projects.number + 1), sortOption.value), searchText);
    first.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, 0, sortOption.value), searchText);
    left.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, parseInt(left.textContent - 1), sortOption.value), searchText);
    middle.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, parseInt(middle.textContent - 1), sortOption.value), searchText);
    right.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, parseInt(right.textContent - 1), sortOption.value)), searchText;
    last.addEventListener('click', () => getProjectsFromAllChannels(channelOption.value, new Date().toISOString(), 32, parseInt(last.textContent - 1), sortOption.value)), searchText;
}

const updateArchiveGui = stats => {

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

}

const showError = () => {
    let main = document.querySelector('main');
    let select = document.querySelector('.selectionWrapper');
    let error = document.createElement('div');
    error.id = "errorDiv";
    error.classList.add('notification', 'is-danger');
    error.textContent = 'Fehler! Keine Projekte von der API erhalten';
    main.insertBefore(error, select);
}

const hideError = () => {

    if (document.getElementById('errorDiv')) {
        let errorDiv = document.getElementById('errorDiv');
        errorDiv.parentElement.removeChild(errorDiv);
    }
}

const updateDeleteGui = stats => {

    let panel = document.getElementById('deleteStatus');
    let info = document.createElement('p');
    info.textContent = `${stats.project} | ${stats.msg}`;
    panel.appendChild(info);

}
