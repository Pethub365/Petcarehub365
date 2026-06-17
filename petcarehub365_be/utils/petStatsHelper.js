/**
 * petStatsHelper.js
 * Helpers for managing dynamic pet stats (e.g. mood and energy decay).
 */

/**
 * Decay pet stats (mood, energy) based on elapsed time.
 * @param {Object} pet - Mongoose Pet document
 * @returns {Boolean} - Returns true if stats were changed and need to be saved
 */
const decayPetStats = (pet) => {
    if (!pet || !pet.stats) return false;

    const now = new Date();
    // Default last_decay_time if not present
    if (!pet.stats.last_decay_time) {
        pet.stats.last_decay_time = pet.updated_at || pet.created_at || now;
        pet.markModified('stats');
        return true;
    }

    const timeDiffMs = now.getTime() - new Date(pet.stats.last_decay_time).getTime();
    if (timeDiffMs <= 0) return false;

    const hoursPassed = timeDiffMs / (1000 * 60 * 60);

    // Decay rates (points per hour)
    const moodDecayRate = 2;   // 48 points per day
    const energyDecayRate = 3; // 72 points per day

    const moodDecay = hoursPassed * moodDecayRate;
    const energyDecay = hoursPassed * energyDecayRate;

    const decayAmountMood = Math.floor(moodDecay);
    const decayAmountEnergy = Math.floor(energyDecay);

    let changed = false;

    if (decayAmountMood > 0) {
        pet.stats.mood = Math.max(0, (pet.stats.mood !== undefined ? pet.stats.mood : 100) - decayAmountMood);
        changed = true;
    }

    if (decayAmountEnergy > 0) {
        pet.stats.energy = Math.max(0, (pet.stats.energy !== undefined ? pet.stats.energy : 100) - decayAmountEnergy);
        changed = true;
    }

    if (changed) {
        // Update last decay time
        pet.stats.last_decay_time = now;
        pet.markModified('stats');
    }

    return changed;
};

module.exports = {
    decayPetStats
};
