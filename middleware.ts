export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/prepare/:path*',
    '/mock/:path*',
    '/voice/:path*',
    '/history/:path*',
    '/bookmarks/:path*',
  ],
};
