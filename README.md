# LaraDesk

**LaraDesk** is a helpdesk ticketing system built with Laravel 8, Vue.js 2, and Tailwind CSS. Customers can submit and track support tickets, while agents can reply, manage, and organize tickets from a clean and modern interface. Email notifications keep both customers and agents up to date on every response.

> 📄 Full documentation: [https://docs.getlaradesk.com](https://docs.getlaradesk.com)  
> 🛒 Purchase: [CodeCanyon](https://codecanyon.net/item/laradesk-helpdesk-ticketing-system/29452696)  
> 🎮 Live Demo: [https://getlaradesk.com/auth/login](https://getlaradesk.com/auth/login)

---

## Features

- 🎫 Ticket management with statuses, priorities, labels, and categories
- 🏢 Organize tickets by departments, labels, and agents
- 💬 Canned replies — insert pre-written responses in 2 clicks
- 📎 File attachments on tickets and replies
- 🔔 Email notifications for every ticket response
- 🌐 Multi-language support
- 📊 Dashboard with statistics and charts
- 🔐 Role-based access control (Super Admin, Agent, Customer)
- 🛠️ 5-step web installer — no code editing required

---

## Requirements

| Requirement   | Version              |
| ------------- | -------------------- |
| PHP           | `>= 7.3` or `>= 8.x` |
| MySQL         | `>= 5.7`             |
| MariaDB       | `>= 10.2.7`          |
| Composer      | Latest               |
| Node.js & NPM | Latest LTS           |

### Required PHP Extensions

`BCMath` · `Ctype` · `Fileinfo` · `JSON` · `Mbstring` · `OpenSSL` · `PDO` · `Tokenizer` · `XML`

Verify your PHP version via SSH:

```bash
php -v
```

> See also: [Laravel Dashboard Requirements](https://dacoto.gitbook.io/laravel-dashboard/v/4.x/getting-started/requirements)

---

## Installation

### Option A: Web Installer (Recommended)

1. Upload the project folder to your server (e.g. via CPanel File Manager)
2. Set permissions `775` on `storage/` and `bootstrap/cache/`
3. Point your domain/subdomain document root to the `public/` folder
4. Create a new database (e.g. via phpMyAdmin)
5. Open your app URL in a browser — the installer wizard will launch automatically
6. Follow the 5-step wizard:
    - ✅ Server requirements check
    - ✅ Folder permissions check
    - ✅ Database connection & migration
    - ✅ Default admin account creation
    - ✅ Installation complete

> After installation the wizard is disabled and can no longer be accessed.  
> Default credentials: **admin@admin.com** / **12345678** — change these immediately.

---

### Option B: Manual Installation (CLI)

```bash
# 1. Clone the repository
git clone https://github.com/kimookpong/laradesk.git
cd laradesk

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies & build assets
npm install
npm run production

# 4. Configure environment
cp .env.example .env
php artisan key:generate

# 5. Edit .env with your database, mail, and app URL settings

# 6. Run migrations and seeders
php artisan migrate --seed

# 7. Link storage
php artisan storage:link

# 8. Serve the application
php artisan serve
```

> For manual installation details, see: [Manual Installation Guide](https://dacoto.gitbook.io/laravel-dashboard/v/4.x/getting-started/installation/manual-installation)

---

## Updating

1. **Always back up your database and files before updating.**
2. Unzip the new version into your application directory (keep your `.env` file).
3. If the update includes database changes, run via SSH:

```bash
php artisan install:update
```

> Updates are released every 7 days when bugs are detected. New features are added frequently.  
> Request features or suggestions: [https://forms.gle/XoEsWWP6wk8cX5tm8](https://forms.gle/XoEsWWP6wk8cX5tm8)

---

## Demo Accounts

| Role        | Email                 | Password |
| ----------- | --------------------- | -------- |
| Super Admin | admin@admin.com       | 12345678 |
| Agent       | agent@agent.com       | 12345678 |
| Customer    | customer@customer.com | 12345678 |

---

## Environment Variables

See `.env.example` for all configurable options. Key variables:

| Variable                                                  | Description                               |
| --------------------------------------------------------- | ----------------------------------------- |
| `APP_NAME`                                                | Application name                          |
| `APP_URL`                                                 | Full URL of your application              |
| `DB_HOST` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | Database connection                       |
| `MAIL_MAILER` / `MAIL_HOST` / `MAIL_PORT`                 | Mail server settings                      |
| `SANCTUM_STATEFUL_DOMAINS`                                | Domains for Sanctum cookie authentication |
| `SENTRY_LARAVEL_DSN`                                      | Sentry error tracking DSN (optional)      |

---

## Running Tests

```bash
php artisan test
```

---

## References

| Resource                  | Link                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📖 Official Documentation | [https://docs.getlaradesk.com](https://docs.getlaradesk.com)                                                                                                                                             |
| 🚀 Getting Started        | [https://docs.getlaradesk.com/getting-started](https://docs.getlaradesk.com/getting-started)                                                                                                             |
| 📋 Requirements           | [https://docs.getlaradesk.com/getting-started/requirements](https://docs.getlaradesk.com/getting-started/requirements)                                                                                   |
| 🔧 Installation Guide     | [https://docs.getlaradesk.com/getting-started/installation](https://docs.getlaradesk.com/getting-started/installation)                                                                                   |
| 🔄 Update Guide           | [https://docs.getlaradesk.com/getting-started/updates](https://docs.getlaradesk.com/getting-started/updates)                                                                                             |
| 🎮 Live Demo              | [https://getlaradesk.com/auth/login](https://getlaradesk.com/auth/login)                                                                                                                                 |
| 🛒 Buy on CodeCanyon      | [https://codecanyon.net/item/laradesk-helpdesk-ticketing-system/29452696](https://codecanyon.net/item/laradesk-helpdesk-ticketing-system/29452696)                                                       |
| 🏗️ Laravel Dashboard Docs | [https://dacoto.gitbook.io/laravel-dashboard/v/4.x](https://dacoto.gitbook.io/laravel-dashboard/v/4.x)                                                                                                   |
| ⚙️ Manual Installation    | [https://dacoto.gitbook.io/laravel-dashboard/v/4.x/getting-started/installation/manual-installation](https://dacoto.gitbook.io/laravel-dashboard/v/4.x/getting-started/installation/manual-installation) |
| 👥 User Role Manager      | [https://dacoto.gitbook.io/laravel-dashboard/v/4.x/dashboard/administration/role-manager](https://dacoto.gitbook.io/laravel-dashboard/v/4.x/dashboard/administration/role-manager)                       |

---

## License

LaraDesk is licensed under the [MIT license](LICENSE).
