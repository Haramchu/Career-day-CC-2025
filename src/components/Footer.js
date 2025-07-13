import {
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaWhatsapp,
  FaDiscord,
} from "react-icons/fa";
import { SiLine } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-700">
        
        {/* Column 1: Profile */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clement Samuel Marly</h2>
          <p className="mt-2 text-sm text-gray-600">
            Information Systems undergraduate at UI. Passionate about code, mentoring, and creativity.
          </p>
          <p className="mt-4 text-xs text-gray-400">© 2025 Clement Samuel. All rights reserved.</p>
        </div>

        {/* Column 2: Contact - Part 1 */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900">Contact</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              <a href="mailto:clementsamuelm@gmail.com" className="hover:underline">Email</a>
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedin className="text-blue-600" />
              <a href="https://linkedin.com/in/clement-samuel-marly-370aab256" target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
            </li>
            <li className="flex items-center gap-2">
              <FaGithub className="text-blue-600" />
              <a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
            </li>
            <li className="flex items-center gap-2">
              <FaInstagram className="text-blue-600" />
              <a href="https://instagram.com/clementsm_chu" target="_blank" rel="noreferrer" className="hover:underline">Instagram</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact - Part 2 */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 invisible lg:visible">Contact</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FaWhatsapp className="text-green-600" />
              <a href="https://wa.me/6287808083396" target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a>
            </li>
            <li className="flex items-center gap-2">
              <FaDiscord className="text-indigo-500" />
              <a href="https://discord.com/users/haramchu" target="_blank" rel="noreferrer" className="hover:underline">Discord</a>
            </li>
            <li className="flex items-center gap-2">
              <SiLine className="text-green-600" />
              <a href="https://line.me/ti/p/mechxlol" target="_blank" rel="noreferrer" className="hover:underline">LINE</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
