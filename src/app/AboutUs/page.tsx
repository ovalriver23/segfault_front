'use client';

import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
};

const floatingVariant = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    }
};

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden relative">
            {/* Background Elements - Subtle and Light */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[120px] mix-blend-multiply" />

            <Navbar />

            <main className="relative max-w-6xl mx-auto px-6 py-32 z-10">
                
                {/* Hero Section */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center mb-32"
                >
                    <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                        Biz Kimiz?
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-bold mb-8 text-gray-900 tracking-tight">
                        Gebze Teknik beyninizi, <br />
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">EasyOrder karnınızı doyurur.</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Bir restoran yönetim paneli. Kan, ter, gözyaşı. <br className="hidden md:block" />
                        Ve her merge conflict'te yükselen çığlık sesleri.
                    </motion.p>
                </motion.section>

                {/* Story Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid md:grid-cols-2 gap-16 items-center mb-32"
                >
                    <motion.div variants={itemVariants} className="order-2 md:order-1 p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl ring-1 ring-gray-900/5">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Nasıl Başladı?</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                            <p>
                                "Bunu Kelebek restorana falan getirsek gerçekten havalı olur" diye düşündük. 
                                Basit bir fikirdi, bir unicorn olma hayaliyle yola çıktık.
                            </p>
                            <p>
                                Sonra insanlardan en çok duyduğumuz şey "Bunu yaptılar lan zaten haberiniz yok mu?" oldu. 
                                Ama biz gülümsedik ve dedik ki: <span className="text-primary-600 font-semibold">"Evet, ama en güzeli bizimki oldu 🤙🏻"</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Abstract Tech Visual replacement for Pizza */}
                    <div className="order-1 md:order-2 relative h-[400px] flex items-center justify-center">
                         <motion.div 
                            variants={floatingVariant}
                            animate="animate"
                            className="absolute z-10 w-64 h-40 bg-white rounded-2xl shadow-2xl flex flex-col p-4 border border-gray-100 transform -rotate-6"
                         >
                            <div className="flex gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-gray-100 rounded" />
                                <div className="h-2 w-1/2 bg-gray-100 rounded" />
                                <div className="h-2 w-full bg-gray-100 rounded" />
                            </div>
                         </motion.div>
                         <motion.div 
                            animate={{
                                y: [-10, 0, -10],
                                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute z-0 w-64 h-40 bg-primary-50 rounded-2xl border border-primary-100 transform translate-x-12 translate-y-12 rotate-6 flex items-center justify-center"
                         >
                             <span className="text-6xl opacity-20">🚀</span>
                         </motion.div>
                         
                         {/* Decorative Orbs */}
                         <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-orange-300 to-red-300 rounded-full blur-2xl opacity-40 animate-pulse" />
                         <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '1s'}} />
                    </div>
                </motion.section>

                 {/* Features Grid */}
                 <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="mb-32"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '🧾',
                                title: 'Sipariş Yönetimi',
                                desc: 'Siparişler kaybolmaz. Sunucu bayılmadığı sürece 😁',
                                color: 'bg-blue-50 border-blue-100 text-blue-600'
                            },
                            {
                                icon: '📦',
                                title: 'Akıllı Stok',
                                desc: 'Pepperoni pizza gerçekten bitmiş mi? Sipariş verdim ama stokta yokmuş derdi yok.',
                                color: 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            },
                            {
                                icon: '📊',
                                title: 'Detaylı Raporlar',
                                desc: 'Neye bakıyosan artık.',
                                color: 'bg-orange-50 border-orange-100 text-orange-600'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className={`p-8 rounded-2xl bg-white border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                            >
                                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center text-3xl mb-6`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* New Team Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="mb-32"
                >
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">Ekibimiz</h2>
                        <p className="text-gray-600">Herkesin parmakla gösterdiği o insanlar:</p>
                    </motion.div>

                    <div className="flex flex-col gap-16">
                        {/* Leaders Row */}
                        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                           {[
                                { name: "Tuana Melisa Aksoi", role: "Project Manager", role2: "Frontend Developer", ring: "ring-purple-400" },
                               { name: "Mehmet Baha Keskin", role: "Product Owner", role2: "Devops/Backend Developer", ring: "ring-blue-400" }
                               
                           ].map((member, i) => (
                               <motion.div variants={itemVariants} key={i} className="text-center group relative">
                                   <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-white p-1 shadow-xl ring-2 ${member.ring} ring-offset-4 ring-offset-gray-50`}>
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <span className="text-5xl opacity-50">👤</span>
                                        </div>
                                   </div>
                                   <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                   <p className="text-primary-600 text-sm font-semibold">{member.role}</p>
                                   <p className="text-gray-500 text-sm">{member.role2}</p>
                               </motion.div>
                           ))}
                        </div>

                        {/* Team Members Row */}
                        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                            {[
                                { name: "Evrim Doğa Solmaz", role: "Frontend/Backend Developer" },
                                { name: "Ahmet Emre Kurt", role: "Frontend Developer" },
                                { name: "Rüya Koçak", role: "Backend Developer" }
                            ].map((member, i) => (
                                <motion.div variants={itemVariants} key={i} className="text-center group">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-[3px] shadow-lg">
                                         <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-white">
                                             <span className="text-4xl opacity-50">👨‍💻</span>
                                         </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-gray-500 text-sm">{member.role}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Final Note */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center border-t border-gray-200 pt-16"
                >
                    <p className="text-gray-600 italic text-lg opacity-90 max-w-2xl mx-auto">
                        "Segfault EasyOrder'ı gururla sunar." <br />
                        <span className="text-xs text-gray-400 mt-3 block font-semibold hover:text-primary-500 transition-colors">(Bu sayfayı bir backend/devopsçu (acaba kim) yaptı ama bizce fena olmadı 😌)</span>
                    </p>
                </motion.section>

            </main>

            <Footer />
        </div>
    );
}
