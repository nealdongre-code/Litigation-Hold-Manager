import { requireChatGPTUser } from './chatgpt-auth';
import Manager from './manager';
export const dynamic='force-dynamic';
export default async function Home(){await requireChatGPTUser('/');return <Manager/>;}
