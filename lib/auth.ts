import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            name:  user.name,
            image: user.image,
          });
        } else {
          await User.updateOne({ email: user.email }, { lastLogin: new Date() });
        }
      } catch (error) {
        console.error('Error in signIn callback:', error);
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, user object is provided
      if (user?.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email }).select('_id');
          if (dbUser) {
            token.userId = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Error in jwt callback (sign-in):', error);
        }
      }

      // If userId is still missing (DB was down during sign-in), retry using token.email
      if (!token.userId && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).select('_id');
          if (dbUser) {
            token.userId = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Error in jwt callback (retry):', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        (session.user as any).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
