// Weather Dashboard App
class WeatherDashboard {
  constructor() {
    this.apiKey = "23e3c51c7e73edad91f3fbbc8fe0562a" // Замените на ваш API ключ
    this.currentUser = null
    this.searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
    this.lastWeatherUpdate = null

    this.init()
  }

  init() {
    this.bindEvents()
    this.checkAuthStatus()
    this.renderSearchHistory()
    this.renderTasks()
    this.setupNavigation()
  }

  bindEvents() {
    // Weather search
    document.getElementById("search-btn").addEventListener("click", () => this.searchWeather())
    document.getElementById("city-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchWeather()
    })

    // Auth events
    document.getElementById("login-btn").addEventListener("click", () => this.showAuthModal("login"))
    document.getElementById("register-btn").addEventListener("click", () => this.showAuthModal("register"))
    document.getElementById("logout-btn").addEventListener("click", () => this.logout())
    document.getElementById("close-modal").addEventListener("click", () => this.hideAuthModal())
    document.getElementById("auth-form").addEventListener("submit", (e) => this.handleAuth(e))
    document.getElementById("auth-switch").addEventListener("click", () => this.switchAuthMode())

    // Task events
    document.getElementById("add-task-btn").addEventListener("click", () => this.showAddTaskForm())
    document.getElementById("save-task-btn").addEventListener("click", () => this.saveTask())
    document.getElementById("cancel-task-btn").addEventListener("click", () => this.hideAddTaskForm())

    // Close modal on outside click
    document.getElementById("auth-modal").addEventListener("click", (e) => {
      if (e.target.id === "auth-modal") this.hideAuthModal()
    })
  }

  setupNavigation() {
    const nav = document.getElementById("sidebar-nav")
    if (!nav) return

    const sections = {
      "section-weather": document.getElementById("section-weather"),
      "tasks-section": document.getElementById("tasks-section"),
      "section-history": document.getElementById("section-history"),
      "section-settings": document.getElementById("section-settings"),
    }

    const showSection = (id) => {
      Object.values(sections).forEach((el) => el && el.classList.add("hidden"))
      const target = sections[id]
      if (target) target.classList.remove("hidden")
    }

    nav.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = item.getAttribute("data-target")
        if (!targetId) return

        // guard: задачи доступны только после входа
        if (targetId === "tasks-section" && !this.currentUser) {
          this.showNotification("Войдите, чтобы открыть задачи", "info")
          this.showAuthModal("login")
          return
        }

        // active class toggle
        nav.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"))
        item.classList.add("active")

        showSection(targetId)
      })
    })

    // показать раздел по умолчанию
    showSection("section-weather")
  }

  async searchWeather() {
    const cityInput = document.getElementById("city-input")
    const city = cityInput.value.trim()

    if (!city) {
      this.showNotification("Введите название города", "error")
      return
    }

    // Check rate limiting (не чаще 1 раза в 2 часа для одного города)
    const lastSearch = this.searchHistory.find((item) => item.city.toLowerCase() === city.toLowerCase())

    if (lastSearch && Date.now() - lastSearch.timestamp < 2 * 60 * 60 * 1000) {
      this.displayWeatherFromCache(lastSearch)
      return
    }

    try {
      this.showLoading()
      const weatherData = await this.fetchWeatherData(city)
      this.displayWeather(weatherData)
      this.addToSearchHistory(city, weatherData)
      cityInput.value = ""
    } catch (error) {
      this.showNotification(this.getErrorMessage(error), "error")
    } finally {
      this.hideLoading()
    }
  }

  async fetchWeatherData(city) {
    // Симуляция API запроса (замените на реальный запрос к OpenWeatherMap)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Симуляция данных
        const mockData = {
          name: city,
          main: {
            temp: Math.round(Math.random() * 30 - 5),
            feels_like: Math.round(Math.random() * 30 - 5),
            humidity: Math.round(Math.random() * 100),
            pressure: Math.round(1000 + Math.random() * 50),
          },
          weather: [
            {
              main: "Clear",
              description: "ясно",
              icon: "01d",
            },
          ],
          wind: {
            speed: Math.round(Math.random() * 10),
            deg: Math.round(Math.random() * 360),
          },
          visibility: Math.round(Math.random() * 10000),
          clouds: {
            all: Math.round(Math.random() * 100),
          },
        }

        if (Math.random() > 0.1) {
          resolve(mockData)
        } else {
          reject(new Error("City not found"))
        }
      }, 1000)
    })
  }

  displayWeather(data) {
    const weatherCard = document.getElementById("weather-card")
    const tasksSection = document.getElementById("tasks-section")

    // Update weather display
    document.getElementById("city-name").textContent = data.name
    document.getElementById("weather-date").textContent = new Date().toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    document.getElementById("temperature").textContent = `${data.main.temp}°C`
    document.getElementById("feels-like").textContent = `Ощущается как ${data.main.feels_like}°C`
    document.getElementById("weather-description").textContent = data.weather[0].description
    document.getElementById("humidity").textContent = `${data.main.humidity}%`
    document.getElementById("pressure").textContent = `${data.main.pressure} гПа`
    document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} км`
    document.getElementById("wind").textContent = `${data.wind.speed} м/с`
    document.getElementById("uv-index").textContent = "Умеренный"
    document.getElementById("clouds").textContent = `${data.clouds.all}%`

    // Set weather icon
    const iconElement = document.getElementById("weather-icon")
    iconElement.textContent = this.getWeatherEmoji(data.weather[0].main)

    weatherCard.classList.remove("hidden")

    // Show tasks section if user is authenticated
    if (this.currentUser) {
      tasksSection.classList.remove("hidden")
    }
  }

  displayWeatherFromCache(cachedData) {
    this.displayWeather(cachedData.data)
    this.showNotification("Показаны кэшированные данные (обновление через 2 часа)", "info")
  }

  getWeatherEmoji(weatherMain) {
    const emojiMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
    }
    return emojiMap[weatherMain] || "🌤️"
  }

  addToSearchHistory(city, data) {
    const historyItem = {
      city,
      data,
      timestamp: Date.now(),
    }

    // Remove existing entry for the same city
    this.searchHistory = this.searchHistory.filter((item) => item.city.toLowerCase() !== city.toLowerCase())

    // Add new entry at the beginning
    this.searchHistory.unshift(historyItem)

    // Keep only last 10 searches
    this.searchHistory = this.searchHistory.slice(0, 10)

    localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory))
    this.renderSearchHistory()
  }

  renderSearchHistory() {
    const historyContainer = document.getElementById("search-history")

    if (this.searchHistory.length === 0) {
      historyContainer.innerHTML = '<p class="text-muted-foreground text-center py-4">История поиска пуста</p>'
      return
    }

    historyContainer.innerHTML = this.searchHistory
      .map(
        (item) => `
            <div class="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30 hover:bg-card/50 transition-colors cursor-pointer"
                 onclick="weatherApp.searchFromHistory('${item.city}')">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${this.getWeatherEmoji(item.data.weather[0].main)}</span>
                    <div>
                        <div class="font-medium text-foreground">${item.city}</div>
                        <div class="text-sm text-muted-foreground">
                            ${new Date(item.timestamp).toLocaleDateString("ru-RU")}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-cosmic-blue">${item.data.main.temp}°C</div>
                    <div class="text-sm text-muted-foreground capitalize">${item.data.weather[0].description}</div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  searchFromHistory(city) {
    document.getElementById("city-input").value = city
    this.searchWeather()
  }

  // Authentication methods
  showAuthModal(mode) {
    const modal = document.getElementById("auth-modal")
    const title = document.getElementById("auth-title")
    const submitText = document.getElementById("auth-submit-text")
    const switchText = document.getElementById("auth-switch")

    if (mode === "login") {
      title.textContent = "Вход"
      submitText.textContent = "Войти"
      switchText.textContent = "Нет аккаунта? Зарегистрироваться"
    } else {
      title.textContent = "Регистрация"
      submitText.textContent = "Зарегистрироваться"
      switchText.textContent = "Уже есть аккаунт? Войти"
    }

    modal.dataset.mode = mode
    modal.classList.remove("hidden")
    modal.classList.add("flex")
  }

  hideAuthModal() {
    const modal = document.getElementById("auth-modal")
    modal.classList.add("hidden")
    modal.classList.remove("flex")
    document.getElementById("auth-form").reset()
  }

  switchAuthMode() {
    const modal = document.getElementById("auth-modal")
    const currentMode = modal.dataset.mode
    this.showAuthModal(currentMode === "login" ? "register" : "login")
  }

  async handleAuth(e) {
    e.preventDefault()

    const email = document.getElementById("auth-email").value
    const password = document.getElementById("auth-password").value
    const mode = document.getElementById("auth-modal").dataset.mode

    try {
      // Симуляция аутентификации (замените на реальный API)
      await this.simulateAuth(email, password, mode)

      this.currentUser = { email }
      this.updateAuthUI()
      this.hideAuthModal()
      this.showNotification(mode === "login" ? "Успешный вход!" : "Регистрация завершена!", "success")

      // Show tasks section if weather is displayed
      const weatherCard = document.getElementById("weather-card")
      const tasksSection = document.getElementById("tasks-section")
      if (!weatherCard.classList.contains("hidden")) {
        tasksSection.classList.remove("hidden")
      }
    } catch (error) {
      this.showNotification(error.message, "error")
    }
  }

  async simulateAuth(email, password, mode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          resolve()
        } else {
          reject(new Error("Неверные данные для входа"))
        }
      }, 1000)
    })
  }

  logout() {
    this.currentUser = null
    this.updateAuthUI()
    document.getElementById("tasks-section").classList.add("hidden")
    this.showNotification("Вы вышли из системы", "info")
  }

  checkAuthStatus() {
    // Проверка сохраненной сессии (упрощенная версия)
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      this.updateAuthUI()
    }
  }

  updateAuthUI() {
    const userInfo = document.getElementById("user-info")
    const authButtons = document.getElementById("auth-buttons")
    const username = document.getElementById("username")

    if (this.currentUser) {
      username.textContent = this.currentUser.email
      userInfo.classList.remove("hidden")
      userInfo.classList.add("flex")
      authButtons.classList.add("hidden")
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
    } else {
      userInfo.classList.add("hidden")
      userInfo.classList.remove("flex")
      authButtons.classList.remove("hidden")
      localStorage.removeItem("currentUser")
    }
  }

  // Task management methods
  showAddTaskForm() {
    document.getElementById("add-task-form").classList.remove("hidden")
    document.getElementById("task-title").focus()
  }

  hideAddTaskForm() {
    document.getElementById("add-task-form").classList.add("hidden")
    document.getElementById("task-title").value = ""
    document.getElementById("task-description").value = ""
  }

  saveTask() {
    const title = document.getElementById("task-title").value.trim()
    const description = document.getElementById("task-description").value.trim()

    if (!title) {
      this.showNotification("Введите название задачи", "error")
      return
    }

    const task = {
      id: Date.now(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      city: document.getElementById("city-name").textContent,
    }

    this.tasks.unshift(task)
    localStorage.setItem("tasks", JSON.stringify(this.tasks))
    this.renderTasks()
    this.hideAddTaskForm()
    this.showNotification("Задача добавлена!", "success")
  }

  renderTasks() {
    const tasksList = document.getElementById("tasks-list")

    if (this.tasks.length === 0) {
      tasksList.innerHTML = '<p class="text-muted-foreground text-center py-4">Нет задач</p>'
      return
    }

    tasksList.innerHTML = this.tasks
      .map(
        (task) => `
            <div class="task-item p-4 bg-card/30 rounded-lg border border-border/30 hover:bg-card/50 transition-all">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <input 
                            type="checkbox" 
                            ${task.completed ? "checked" : ""} 
                            onchange="weatherApp.toggleTask(${task.id})"
                            class="mt-1 w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
                        >
                        <div class="flex-1">
                            <h3 class="font-medium text-foreground ${task.completed ? "line-through opacity-60" : ""}">${task.title}</h3>
                            ${task.description ? `<p class="text-sm text-muted-foreground mt-1 ${task.completed ? "line-through opacity-60" : ""}">${task.description}</p>` : ""}
                            <div class="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <span>📍 ${task.city}</span>
                                <span>📅 ${new Date(task.createdAt).toLocaleDateString("ru-RU")}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onclick="weatherApp.deleteTask(${task.id})" 
                        class="text-destructive hover:text-destructive/80 transition-colors ml-4"
                        title="Удалить задачу"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      localStorage.setItem("tasks", JSON.stringify(this.tasks))
      this.renderTasks()
    }
  }

  deleteTask(taskId) {
    if (confirm("Удалить эту задачу?")) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      localStorage.setItem("tasks", JSON.stringify(this.tasks))
      this.renderTasks()
      this.showNotification("Задача удалена", "info")
    }
  }

  // Utility methods
  showLoading() {
    const searchBtn = document.getElementById("search-btn")
    searchBtn.textContent = "Поиск..."
    searchBtn.disabled = true
  }

  hideLoading() {
    const searchBtn = document.getElementById("search-btn")
    searchBtn.textContent = "Найти"
    searchBtn.disabled = false
  }

  showNotification(message, type = "info") {
    // Создание уведомления
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`

    const colors = {
      success: "bg-primary/20 border border-primary text-foreground",
      error: "bg-destructive/20 border border-destructive text-destructive",
      info: "bg-muted/20 border border-border text-muted-foreground",
    }

    notification.className += ` ${colors[type]}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Анимация появления
    setTimeout(() => {
      notification.classList.remove("translate-x-full")
    }, 100)

    // Автоматическое скрытие
    setTimeout(() => {
      notification.classList.add("translate-x-full")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  getErrorMessage(error) {
    const errorMessages = {
      "City not found": "Город не найден",
      "Network error": "Ошибка сети",
      "API limit exceeded": "Превышен лимит запросов",
    }

    return errorMessages[error.message] || "Произошла ошибка при получении данных о погоде"
  }
}

// Initialize the app
const weatherApp = new WeatherDashboard()

