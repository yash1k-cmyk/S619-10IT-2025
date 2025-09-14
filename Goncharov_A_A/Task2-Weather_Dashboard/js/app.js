// Weather Dashboard App
class WeatherDashboard {
  constructor() {
    this.apiKey = this.loadApiKey()
    this.baseUrl = "http://localhost:8000/api" // Backend API URL
    this.currentUser = null
    this.searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
    this.lastWeatherUpdate = null
    this.isOnline = navigator.onLine
    this.settings = this.loadSettings()
    this.autoUpdateInterval = null

    this.init()
  }

  init() {
    this.bindEvents()
    this.checkAuthStatus()
    this.renderSearchHistory()
    this.renderTasks()
    this.setupNavigation()
    this.setupOfflineHandling()
    this.setupSettings()
    this.applySettings()
  }

  loadApiKey() {
    // Fallback на хардкод (для разработки)
    // В продакшене API ключ должен загружаться с сервера
    return "23e3c51c7e73edad91f3fbbc8fe0562a"
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
    // Сначала пробуем получить данные из backend API
    if (this.isOnline && this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/weather/${encodeURIComponent(city)}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.currentUser && { 'Authorization': `Bearer ${this.getAuthToken()}` })
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            return this.transformBackendData(data.data)
          }
        }
      } catch (error) {
        console.warn('Backend API недоступен, используем прямой запрос к OpenWeatherMap:', error)
      }
    }

    // Прямой запрос к OpenWeatherMap API
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=ru`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Город не найден")
        }
        if (response.status === 401) {
          throw new Error("Неверный API ключ")
        }
        if (response.status === 429) {
          throw new Error("Превышен лимит запросов к API")
        }
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ошибка при получении данных о погоде:', error)
      throw error
    }
  }

  transformBackendData(data) {
    // Преобразование данных из backend в формат OpenWeatherMap
    return {
      name: data.city.name,
      main: {
        temp: data.temperature,
        feels_like: data.feels_like,
        humidity: data.humidity,
        pressure: data.pressure,
      },
      weather: [{
        main: this.getWeatherMainFromDescription(data.description),
        description: data.description,
        icon: data.icon,
      }],
      wind: {
        speed: data.wind_speed,
        deg: data.wind_direction,
      },
      visibility: data.visibility,
      clouds: {
        all: data.clouds,
      },
    }
  }

  getWeatherMainFromDescription(description) {
    const desc = description.toLowerCase()
    if (desc.includes('ясно') || desc.includes('солнечно')) return 'Clear'
    if (desc.includes('облачно') || desc.includes('пасмурно')) return 'Clouds'
    if (desc.includes('дождь')) return 'Rain'
    if (desc.includes('снег')) return 'Snow'
    if (desc.includes('туман')) return 'Mist'
    return 'Clear'
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

    // Простая валидация
    if (!email || !password) {
      this.showNotification("Заполните все поля", "error")
      return
    }

    if (password.length < 6) {
      this.showNotification("Пароль должен содержать минимум 6 символов", "error")
      return
    }

    try {
      if (this.isOnline && this.baseUrl) {
        // Реальная аутентификация через API
        await this.authenticateWithAPI(email, password, mode)
      } else {
        // Fallback: симуляция аутентификации
        await this.simulateAuth(email, password, mode)
      }

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
      console.error('Ошибка аутентификации:', error)
      this.showNotification(error.message, "error")
    }
  }

  async authenticateWithAPI(email, password, mode) {
    const endpoint = mode === "login" ? "login" : "register"
    const response = await fetch(`${this.baseUrl}/auth/${endpoint}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка аутентификации')
    }

    if (mode === "login" && data.token) {
      this.setAuthToken(data.token)
    }
  }

  async simulateAuth(email, password, mode) {
    // Простая проверка для offline режима
    if (email && password.length >= 6) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error("Неверные данные для входа"))
    }
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

  // Offline handling
  setupOfflineHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.showNotification('Соединение восстановлено', 'success')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.showNotification('Работа в офлайн режиме', 'info')
    })
  }

  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  setAuthToken(token) {
    localStorage.setItem('authToken', token)
  }

  removeAuthToken() {
    localStorage.removeItem('authToken')
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
      "Город не найден": "Город не найден",
      "Неверный API ключ": "Ошибка настройки API ключа",
      "Превышен лимит запросов к API": "Слишком много запросов, попробуйте позже",
      "Network error": "Ошибка сети",
      "Failed to fetch": "Нет соединения с интернетом",
    }

    return errorMessages[error.message] || `Ошибка: ${error.message}`
  }

  // Settings management
  loadSettings() {
    const defaultSettings = {
      darkTheme: true,
      animations: true,
      units: 'metric',
      language: 'ru',
      autoUpdate: false,
      soundNotifications: false,
      weatherAlerts: true,
    }
    
    const saved = localStorage.getItem('appSettings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  }

  saveSettingsToStorage() {
    localStorage.setItem('appSettings', JSON.stringify(this.settings))
  }

  setupSettings() {
    // Bind settings events
    document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings())
    document.getElementById('reset-settings-btn')?.addEventListener('click', () => this.resetSettings())
    
    // Bind individual setting changes
    document.getElementById('dark-theme-toggle')?.addEventListener('change', (e) => {
      this.settings.darkTheme = e.target.checked
      this.applyTheme()
    })
    
    document.getElementById('animations-toggle')?.addEventListener('change', (e) => {
      this.settings.animations = e.target.checked
      this.applyAnimations()
    })
    
    document.getElementById('units-select')?.addEventListener('change', (e) => {
      this.settings.units = e.target.value
    })
    
    document.getElementById('language-select')?.addEventListener('change', (e) => {
      this.settings.language = e.target.value
    })
    
    document.getElementById('auto-update-toggle')?.addEventListener('change', (e) => {
      this.settings.autoUpdate = e.target.checked
      this.setupAutoUpdate()
    })
    
    document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
      this.settings.soundNotifications = e.target.checked
    })
    
    document.getElementById('weather-alerts-toggle')?.addEventListener('change', (e) => {
      this.settings.weatherAlerts = e.target.checked
    })
  }

  applySettings() {
    // Apply theme
    this.applyTheme()
    
    // Apply animations
    this.applyAnimations()
    
    // Apply units
    this.applyUnits()
    
    // Apply language
    this.applyLanguage()
    
    // Setup auto-update
    this.setupAutoUpdate()
    
    // Load settings into UI
    this.loadSettingsIntoUI()
  }

  loadSettingsIntoUI() {
    document.getElementById('dark-theme-toggle').checked = this.settings.darkTheme
    document.getElementById('animations-toggle').checked = this.settings.animations
    document.getElementById('units-select').value = this.settings.units
    document.getElementById('language-select').value = this.settings.language
    document.getElementById('auto-update-toggle').checked = this.settings.autoUpdate
    document.getElementById('sound-toggle').checked = this.settings.soundNotifications
    document.getElementById('weather-alerts-toggle').checked = this.settings.weatherAlerts
  }

  applyTheme() {
    if (this.settings.darkTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  applyAnimations() {
    if (this.settings.animations) {
      document.documentElement.classList.remove('no-animations')
    } else {
      document.documentElement.classList.add('no-animations')
    }
  }

  applyUnits() {
    // This would be used when fetching weather data
    // For now, we'll just store the preference
    console.log('Units changed to:', this.settings.units)
  }

  applyLanguage() {
    // This would be used for API calls and UI text
    // For now, we'll just store the preference
    console.log('Language changed to:', this.settings.language)
  }

  setupAutoUpdate() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval)
      this.autoUpdateInterval = null
    }
    
    if (this.settings.autoUpdate) {
      // Update every 30 minutes
      this.autoUpdateInterval = setInterval(() => {
        const cityInput = document.getElementById('city-input')
        if (cityInput.value.trim()) {
          this.searchWeather()
        }
      }, 30 * 60 * 1000) // 30 minutes
    }
  }

  resetSettings() {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      localStorage.removeItem('appSettings')
      this.settings = this.loadSettings()
      this.applySettings()
      this.loadSettingsIntoUI()
      this.showNotification('Настройки сброшены', 'info')
    }
  }

  saveSettings() {
    this.saveSettingsToStorage()
    this.showNotification('Настройки сохранены', 'success')
  }
}

// Initialize the app
const weatherApp = new WeatherDashboard()

