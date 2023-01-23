import axios from 'axios'


type Card = {
    id: number,
    title: string,
    description: string,
    tags: string,
    image: string
}

const selectors = {
    url: 'http://localhost:1337/memos/',
    cardsGrid: document.querySelector<HTMLDivElement | null>('.js-cards-grid'),
    modal: document.querySelector<HTMLDivElement | null>('.js-modal'),
    cardSave: '.js-card-save',
    addBtn: '.js-add-btn',
    modalClose: '.js-modal-close',
}

const createTagsHtml = (tags: string) => {
    const tagsArray = tags.split(';')

    return tagsArray.reduce((acc, curr) =>  {
        return acc += curr.length > 0 ? `<span class="tag is-info is-light">${curr}</span>` : ''
    }, '')
}

const createCardHtml = (card: Card) => {

    return `
    <div class="card memo-card js-memo-card" data-card-id="${ card.id }">
        <div class="card-image">
            <figure class="image is-4by3">
                <img src="${ card.image }" alt="${ card.title }" class="card-img js-card-img">
            </figure>
        </div>
        <div class="card-content">
            <div class="title is-4">
                ${ card.title }
            </div>
            <div class="content">
                ${ card.description }
                <div class="tags">
                    ${ card.tags.length > 0 && createTagsHtml(card.tags) }
                </div>
            </div>
        </div>
        <footer class="card-footer">
            <a href="#" class="card-footer-item js-card-edit">Edit</a>
            <a href="#" class="card-footer-item js-card-delete">Delete</a>
        </footer>
    </div>
    `
}

const displayCards = () => {
    axios.get<Card[]>(selectors.url).then((res) => {
        selectors.cardsGrid.innerHTML = ''
        res.data.forEach(card => {
            selectors.cardsGrid.innerHTML += createCardHtml(card)
        })
    }).catch(e => alert(e.message))
}

const showModal = () => {
    selectors.modal.classList.add('is-active')
}

const closeModal = () => {
    selectors.modal.classList.remove('is-active')
}

const enlargeImage = (img: string) => {
    selectors.modal.innerHTML = 
    `
        <div class="modal-background js-modal-close"></div>
        <div class="modal-content">
            <p class="image">
                <img src="${ img }" alt="">
            </p>
        </div>
        <button class="modal-close is-large js-modal-close" aria-label="close"></button>
    `
    showModal()
}

const cardModalFormHtml = (card: Card | undefined = undefined) => {
    let saveBtnText = 'Save changes'

    if(!card) {
        saveBtnText = 'Submit'

        card = {
            id: 0,
            title: '',
            description: '',
            tags: '',
            image: ''
        }
    }

    selectors.modal.innerHTML = 
    `
        <div class="modal-background js-modal-close"></div>
        <div class="modal-card">
            <header class="modal-card-head">
            <p class="modal-card-title">${ card.title }</p>
            <button class="delete js-modal-close" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">Title</label>
                    <div class="control">
                        <input class="input js-form-title" type="text" value="${ card.title }" placeholder="Title ...">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Description</label>
                    <div class="control">
                        <textarea class="textarea js-form-desc" placeholder="Description ...">${ card.description }</textarea>
                    </div>
                </div>
                <div class="field">
                    <label class="label">Tags</label>
                    <div class="control">
                        <input class="input js-form-tags" type="text" value="${ card.tags }" placeholder="Tags ...">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Image link</label>
                    <div class="control">
                        <input class="input js-form-img" type="text" value="${ card.image }" placeholder="Image link ...">
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
            <button class="button is-success js-card-save" data-card-id="${ card.id }">${ saveBtnText }</button>
            <button class="button js-modal-close">Cancel</button>
            </footer>
        </div>
    `

    showModal()
}

const editCard = (id: number) => {
    axios.get<Card>(selectors.url + id)
        .then((card) => {

            cardModalFormHtml(card.data)

        }).catch(e => alert(e.message))
}

const saveCard = (id: number) => {
    const   title = document.querySelector<HTMLInputElement | null>('.js-form-title').value,
            desc = document.querySelector<HTMLInputElement | null>('.js-form-desc').value,
            tags = document.querySelector<HTMLInputElement | null>('.js-form-tags').value,
            img = document.querySelector<HTMLInputElement | null>('.js-form-img').value;
    
    if(id) {
        axios.put<Card>(selectors.url + id, {
            title: title,
            description: desc,
            tags: tags,
            image: img
        }).then(posted => {

            displayCards()
            closeModal()

        }).catch(e => alert(e.message))

    } else {
        axios.post<Card>(selectors.url, {

            title: title,
            description: desc,
            tags: tags,
            image: img

        }).then(posted => {

            selectors.cardsGrid.innerHTML += createCardHtml(posted.data)
            closeModal()

        }).catch(e => alert(e.message))
    }
}

const deleteCard = (id: number) => {

    const confirmDeletion = confirm('Are you sure about that?')

    if(!confirmDeletion) return

    axios.delete<Card>(selectors.url + id)
        .then((data) => {

            const card = document.querySelector<HTMLDivElement>(`[data-card-id="${id}"]`)

            card.remove()
        })
        .catch(e => alert(e.message))
}


displayCards()

document.addEventListener('click', (e) => {
    const target = <HTMLDivElement>e.target

    if(target.closest(selectors.addBtn)) {

        e.preventDefault()
        cardModalFormHtml()

    } else if(target.closest(selectors.modalClose)) {

        closeModal()

    } else if(target.closest('.js-card-img')) {

        enlargeImage(target.closest<HTMLImageElement>('.js-card-img').src)
        showModal()

    } else if(target.closest('.js-card-save')) {

        const cardId = target.closest('.js-card-save').getAttribute('data-card-id')
        saveCard(Number(cardId))

    } else if(target.closest('.js-card-edit')) {

        e.preventDefault()
        const cardId = target.closest('.js-memo-card').getAttribute('data-card-id')
        editCard(Number(cardId))
        
    } else if(target.closest('.js-card-delete')) {

        e.preventDefault()
        const cardId = target.closest('.js-memo-card').getAttribute('data-card-id')
        deleteCard(Number(cardId))
        
    }
})
