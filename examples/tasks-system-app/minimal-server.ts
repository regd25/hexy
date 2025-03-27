import { ExpressAdapter } from '@hexy/infrastructure'
import { container } from '@hexy/domain'

async function bootstrap() {
    // Create Express adapter with minimal configuration
    const expressAdapter = new ExpressAdapter(container, {
        port: 3000,
        enableCors: true,
        enableBodyParser: true,
    });

    // Start the server
    await expressAdapter.listen();
    console.log('Minimal API is running on http://localhost:3000');
}

console.log('Starting minimal application...');
bootstrap().catch((error) => {
    console.error('Failed to start the application:', error);
    process.exit(1);
}); 