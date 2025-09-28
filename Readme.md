# Vita AI Smart Task Manager (Backend)

A Node.js/TypeScript service that provides intelligent wellness task recommendations with deterministic scoring, anti-nag substitution algorithms, time-based task gating, and daily progress resets. The service exposes a minimal HTTP API that delivers precisely four personalized tasks in a consistent, reproducible order.

---

## Quick Start

### Setup
For detailed local setup instructions, follow the [setup guide](./Setup.md).

### API Documentation
For comprehensive API documentation including all endpoints, request/response formats, and examples, see the [routes documentation](./Routes.md).

---

## Architecture

The service is built with:
- **Express.js** for HTTP routing
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Zod** for request validation
- **Cookie-based authentication** for simplicity

## Key Concepts

### Task Scoring Algorithm
Tasks are scored based on:
- User's current progress toward goals
- Task impact weight (1-5 scale)
- Required effort and time investment
- Historical completion patterns
- Time-of-day appropriateness

### Anti-Nag System
Prevents user fatigue by:
- Rotating similar tasks across different time periods
- Avoiding repetitive suggestions within the same session
- Balancing high-impact tasks with achievable quick wins

### Deterministic Ordering
Ensures consistent user experience by:
- Using reproducible scoring algorithms
- Maintaining stable task ordering across sessions
- Providing predictable recommendation patterns

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.