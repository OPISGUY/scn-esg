import { motion } from 'framer-motion';
import { Globe, Leaf, Droplet, CheckCircle, TrendingUp } from 'lucide-react';

interface ProjectCard {
  id: number;
  title: string;
  location: string;
  type: string;
  pricePerTonne: number;
  availableCredits: number;
  certification: string;
  icon: typeof Globe;
  gradient: string;
}

export default function CarbonMarketplacePreview() {
  const projects: ProjectCard[] = [
    {
      id: 1,
      title: 'Amazon Rainforest Protection',
      location: 'Brazil',
      type: 'Reforestation',
      pricePerTonne: 12,
      availableCredits: 5000,
      certification: 'Gold Standard',
      icon: Leaf,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 2,
      title: 'Solar Farm Development',
      location: 'Morocco',
      type: 'Renewable Energy',
      pricePerTonne: 18,
      availableCredits: 3500,
      certification: 'Verra VCS',
      icon: Globe,
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      id: 3,
      title: 'Ocean Conservation Project',
      location: 'Indonesia',
      type: 'Blue Carbon',
      pricePerTonne: 22,
      availableCredits: 2000,
      certification: 'Plan Vivo',
      icon: Droplet,
      gradient: 'from-blue-500 to-cyan-600'
    }
  ];

  const marketStats = [
    { label: 'Verified Projects', value: '1,250+' },
    { label: 'Total Credits Available', value: '500k+' },
    { label: 'Countries Represented', value: '45+' },
    { label: 'Average Price/Tonne', value: '£15' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-green-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Project Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {projects.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow"
            >
              {/* Card Header with Gradient */}
              <div className={`bg-gradient-to-br ${project.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <Icon className="w-12 h-12 mb-3" />
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">{project.location}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">{project.type}</span>
                  </div>
                </div>
                {/* Decorative Background Shape */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                />
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Certification Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">{project.certification}</span>
                  <span className="text-xs text-gray-500">Certified</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    £{project.pricePerTonne}
                    <span className="text-lg text-gray-500 font-normal">/tonne CO₂e</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {project.availableCredits.toLocaleString()} credits available
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Demand</span>
                    <span>High</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ delay: 0.6 + index * 0.15, duration: 1 }}
                      className={`bg-gradient-to-r ${project.gradient} h-2 rounded-full`}
                    />
                  </div>
                </div>

                {/* Purchase Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r ${project.gradient} text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Purchase Credits
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-8 text-center border border-gray-200"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Explore Verified Carbon Credit Projects
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Browse our curated marketplace of verified carbon offset projects. Every purchase is tracked,
          transparent, and contributes to meaningful climate action.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
        >
          <Globe className="w-6 h-6" />
          Browse Full Marketplace
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
