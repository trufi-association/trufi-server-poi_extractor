# Contributing to trufi-server-poi_extractor

Thank you for your interest in contributing to trufi-server-poi_extractor! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
1. Check the [existing issues](https://github.com/trufi-association/trufi-server-poi_extractor/issues) to avoid duplicates
2. Collect information about the bug:
   - Node.js version (`node --version`)
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs

Create a new issue with the "Bug Report" template.

### Suggesting Features

We welcome feature suggestions! Please:
1. Check existing issues and discussions for similar ideas
2. Create a new issue with the "Feature Request" template
3. Describe the use case and expected behavior
4. Explain why this would be valuable to other users

### Submitting Code

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trufi-server-poi_extractor.git
   cd trufi-server-poi_extractor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Make your changes** in the `src/` directory
2. **Run type checking**:
   ```bash
   npm run typecheck
   ```
3. **Test your changes** locally:
   ```bash
   # Test with PBF file
   npm run dev -- -i test.osm.pbf -o ./out -v

   # Test with Overpass API
   npm run dev -- --bbox -17.45,-66.25,-17.30,-66.10 -o ./out -v
   ```
4. **Build** to ensure everything compiles:
   ```bash
   npm run build
   ```

#### Commit Guidelines

We follow conventional commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom Overpass endpoints
fix: handle empty way geometries gracefully
docs: add examples for custom categories
```

#### Pull Request Process

1. Update documentation if needed
2. Ensure all checks pass
3. Fill out the PR template completely
4. Link any related issues
5. Request review from maintainers

### Adding New Categories

To propose new default categories:

1. Create an issue explaining the use case
2. Provide the OSM tags that should be matched
3. Include examples of POIs that would be captured
4. Consider if it overlaps with existing categories

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples
- Translate to other languages
- Improve code comments

## Project Structure

```
trufi-server-poi_extractor/
├── src/
│   ├── cli.ts              # Command-line interface
│   ├── index.ts            # Library exports
│   ├── types.ts            # TypeScript type definitions
│   ├── categories.ts       # Default category configuration
│   ├── utils.ts            # Utility functions
│   ├── pbf-extractor.ts    # PBF file extraction logic
│   └── overpass-extractor.ts # Overpass API extraction logic
├── .github/
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── workflows/          # CI/CD workflows
├── package.json
├── tsconfig.json
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Handle errors appropriately

## Testing

Currently, the project uses manual testing. Contributions to add automated tests are welcome!

To test manually:
1. Download a small PBF file for testing
2. Run extraction and verify output
3. Test edge cases (empty results, large files, etc.)

## Questions?

- Open a [Discussion](https://github.com/trufi-association/trufi-server-poi_extractor/discussions) for general questions
- Join the [Trufi Association community](https://www.trufi-association.org/)
- Contact us at info@trufi-association.org

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

Thank you for contributing to open transit solutions!
