'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');

//inputs
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const inputTypeEdit = document.querySelector('.form__input--type--edit');
const inputDistanceEdit = document.querySelector('.form__input--distance--edit');
const inputDurationEdit = document.querySelector('.form__input--duration--edit');
const inputCadenceEdit = document.querySelector('.form__input--cadence--edit');
const inputElevationEdit = document.querySelector('.form__input--elevation--edit');
const cadenceEdit=document.querySelector(".cadence--row")
const elevationEdit=document.querySelector(".elevation--row")



const formEdit = document.querySelector('.formEdit');


const removeAll = document.querySelector(".remove__all")
const btnRemove = document.querySelector(".btn__remove")


class workout {
    date = new Date()
    id = (Date.now() + "").slice(-10)
    constructor(cords, distance, duration) {
        this.cords = cords
        this.distance = distance
        this.duration = duration
    }

    _workoutDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.info = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`

    }
}

class cycling extends workout {
    type = "cycling"
    constructor(cords, distance, duration, elevationGain) {
        super(cords, distance, duration)
        this.elevationGain = elevationGain
        this._calcSpeed()
        this._workoutDate()

    }
    _calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
    }
}

class running extends workout {
    type = "running"
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration)
        this.cadence = cadence
        this._calcPace()
        this._workoutDate()
    }

    _calcPace() {
        this.pace = this.duration / this.distance
    }
}


class App {

    #map
    #eventMap
    #workouts = []
    #marks = []
    #mark

    constructor() {
        this._getPosition()
        //obtener los datos de local storge
        this._getLocalStorage()
        form.addEventListener('submit', this._newWorkout.bind(this))
        
        inputType.addEventListener('change', this._toogleElevatioField)
        removeAll.addEventListener("click", this._removeAll.bind(this))
        containerWorkouts.addEventListener("click", this._moveWorkout.bind(this))
        containerWorkouts.addEventListener("click", this._containerWorkout.bind(this))

    }



    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), noPermiss)
        function noPermiss() {
            console.alert("no")
        }

    }

    _loadMap(cord) {
        this.#map = L.map('map').setView([cord.coords.latitude, cord.coords.longitude], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this))
        this.#workouts.forEach(work => {
            this._newMarkerWoorkout(work)
        })
    }

    _showForm(e) {
        this.#eventMap = e
        form.classList.remove("hidden")
        inputDistance.focus()

    }

    _hideForm() {
        inputElevation.values = inputDistance.value = inputDuration.value = inputCadence.value = ""

        form.classList.add("hidden")
    }

    _toogleElevatioField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden")
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden")
    }

    _newWorkout(e) {

        function isNumber(...number) {
            return number.every(i => Number.isFinite(i))
        }
        function isPositive(...number) {
            return number.every(i => i > 0)
        }

        e.preventDefault()

        const distance = +inputDistance.value
        const duration = +inputDuration.value
        const type = inputType.value

        const { lat: latitud, lng: longitud } = this.#eventMap.latlng
        let workout;

        if (type === "running") {
            const cadence = +inputCadence.value
            if (!isNumber(distance, duration, cadence) || !isPositive(distance, duration, cadence)) return alert("hola")
            workout = new running([latitud, longitud], distance, duration, cadence)

        }

        if (type === "cycling") {
            const elevation = +inputElevation.value
            if (!isNumber(distance, duration, elevation) || !isPositive(distance, duration)) return alert("hola")
            workout = new cycling([latitud, longitud], distance, duration, elevation)
        }

        this.#workouts.push(workout)
        this._newMarkerWoorkout(workout)
        this._newAddWorkout(workout)
        this._hideForm()
        this._setLocalStorage()
    }

    _newMarkerWoorkout(workout) {
        this.#mark = L.marker(workout.cords).addTo(this.#map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            }))
            .setPopupContent(`${workout.type === "running" ? "🏃" : "🚴‍♀️"} ${workout.info}`)
            .openPopup();
        this.#marks.push(this.#mark)
        console.log(this.#marks);
    }

    _newAddWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <input type="button" class="btn__remove" value="remove">
        <input type="button" class="btn__edit" value="edit">
          <h2 class="workout__title">${workout.info}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "🏃" : "🚴‍♀️"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `

        if (workout.type === "running") {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value min">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
            `
        }
        if (workout.type === "cycling") {
            html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
            `
        }

        form.insertAdjacentHTML("afterend", html)
    }

    _moveWorkout(e) {
        let container = e.target.closest(".workout")

        if (!container) return
        const moveWorkout = this.#workouts.find(i => i.id === container.dataset.id);

        this.#map.setView(moveWorkout.cords, 13, {
            animate: true,
            pan: {
                duration: 1
            }
        })
    }
    _removeWorkout(container) {
        const index = this.#workouts.findIndex(i => i.id === container.dataset.id)
        this.#workouts.splice(index, 1)
        container.remove()
        this._removeMarker(index)
        this._removeLocalStorage(this.#workouts)
    }

    _setLocalStorage() {
        //se guarda la informacion de los entranamientos dentro de localstorage
        //se tiene que pasar una llave para accceder a los elementos guardados dentro de localStorage
        localStorage.setItem("workouts", JSON.stringify(this.#workouts))
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem("workouts", this.#workouts))

        if (!data) return

        this.#workouts = data

        this.#workouts.forEach(work => {
            this._newAddWorkout(work)
        })
    }

    _removeLocalStorage(workout) {
        localStorage.setItem("workouts", JSON.stringify(workout))
    }
    _removeMarker(index) {
        const mark = this.#marks[index]
        this.#marks.splice(index, 1)
        this.#map.removeLayer(mark)
    }
    _removeAll() {
        const html = document.querySelectorAll(".workout")
        html.forEach(i => {
            i.remove()
        })
        this.#marks.forEach(i => {
            this.#map.removeLayer(i)
        })
        this.#workouts.length = 0
        this.#marks.length = 0
        this._removeLocalStorage(this.#workouts)
    }
    _showFormEdit() {
        formEdit.classList.toggle("hidden")
        
    }

    _containerWorkout(e) {
        let container = e.target.closest(".workout")
        let btnRemove = e.target.classList.contains("btn__remove")
        let btnEdit = e.target.classList.contains("btn__edit")

        if (btnRemove) this._removeWorkout(container)
        if (btnEdit){
            this._showFormEdit() 
            formEdit.addEventListener('submit',(e)=>this._formEdit(e, container))
        }
    }

    _formEdit(e,container){
        e.preventDefault()
        const editWorkout = this.#workouts.find(i => i.id === container.dataset.id)
        const duration=+inputDurationEdit.value
        const distance=+inputDistanceEdit.value

        console.log(editWorkout.type);

        if (editWorkout.type==="running") {
            elevationEdit.closest(".form__row").classList.toggle("form__row--hidden")
            cadenceEdit.closest(".form__row").classList.toggle("form__row--hidden")
            console.log("hola");
        }
        if (editWorkout.type==="cycling") {
            elevationEdit.closest(".form__row").classList.toggle("form__row--hidden")
            cadenceEdit.closest(".form__row").classList.toggle("form__row--hidden")
            console.log("hola");
        }

        elevationEdit.values = inputDistanceEdit.value = inputDurationEdit.value = cadenceEdit.value = ""

        formEdit.classList.add("hidden")


    }

}

const app = new App();






