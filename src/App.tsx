/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerProfile, LessonStage, ParentConfig } from './types';
import { ZONES_DATA } from './data/curriculumData';
import { GameStorage } from './services/storageService';
import { sound } from './services/audioService';
import { voice } from './services/voiceService';
import { HeaderHUD } from './components/HeaderHUD';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { ArcadeScreen } from './screens/ArcadeScreen';
import { RewardsCenterScreen } from './screens/RewardsCenterScreen';
import { SmartReviewScreen } from './screens/SmartReviewScreen';
import { StagePlayScreen } from './screens/StagePlayScreen';
import { ParentDashboardModal } from './components/ParentDashboardModal';
import { ProfileModal } from './components/ProfileModal';
import { IntroCreationModal } from './components/IntroCreationModal';
import { CashExchangeModal } from './components/CashExchangeModal';
import { VoiceNarrationBar } from './components/VoiceNarrationBar';
import { WelcomeAudioBanner } from './components/WelcomeAudioBanner';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => GameStorage.getProfile());
  const [parentConfig, setParentConfig] = useState<ParentConfig>(() => GameStorage.getParentConfig());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeStage, setActiveStage] = useState<LessonStage | null>(null);

  // Modals state
  const [showParentModal, setShowParentModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showExchangeModal, setShowExchangeModal] = useState<boolean>(false);
  const [showIntroModal, setShowIntroModal] = useState<boolean>(() => {
    const p = GameStorage.getProfile();
    return p.completedStages.length === 0 && p.name === 'بطل المعرفة';
  });

  // Sync sound & voice states
  useEffect(() => {
    sound.setMuted(!profile.soundEnabled);
    voice.setEnabled(profile.voiceNarratorEnabled);
  }, [profile.soundEnabled, profile.voiceNarratorEnabled]);

  const refreshProfileState = () => {
    const updated = GameStorage.getProfile();
    setProfile({ ...updated });
    setParentConfig({ ...GameStorage.getParentConfig() });
  };

  const handleSoundToggle = () => {
    const nextSound = !profile.soundEnabled;
    const updated = { ...profile, soundEnabled: nextSound };
    GameStorage.saveProfile(updated);
    setProfile(updated);
    sound.setMuted(!nextSound);
  };

  const handleVoiceToggle = () => {
    const nextVoice = !profile.voiceNarratorEnabled;
    const updated = { ...profile, voiceNarratorEnabled: nextVoice };
    GameStorage.saveProfile(updated);
    setProfile(updated);
    voice.setEnabled(nextVoice);
    if (nextVoice) {
      voice.speak('تم تشغيل الراوي الصوتي بنجاح!');
    } else {
      voice.stop();
    }
  };

  const handleStartStage = (stage: LessonStage) => {
    setActiveStage(stage);
  };

  const handleFinishStage = () => {
    setActiveStage(null);
    refreshProfileState();
  };

  const unresolvedMistakes = profile.mistakesHistory.filter(m => !m.resolved).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      {/* Top HUD Header */}
      <HeaderHUD
        profile={profile}
        onOpenParent={() => setShowParentModal(true)}
        onProfileClick={() => setShowProfileModal(true)}
        onSoundToggle={handleSoundToggle}
        onVoiceToggle={handleVoiceToggle}
        onOpenExchange={() => setShowExchangeModal(true)}
      />

      {/* Welcome Audio Prompt */}
      <WelcomeAudioBanner playerName={profile.name} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeStage ? (
          <StagePlayScreen
            stage={activeStage}
            playerCoins={profile.coins}
            onFinishStage={handleFinishStage}
            onExit={() => {
              voice.stop();
              setActiveStage(null);
            }}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                profile={profile}
                zones={ZONES_DATA}
                onStartStage={handleStartStage}
                onNavigateTab={(tab) => {
                  if (tab === 'profile') setShowProfileModal(true);
                  else setCurrentTab(tab);
                }}
                onOpenExchange={() => setShowExchangeModal(true)}
              />
            )}

            {currentTab === 'map' && (
              <WorldMapScreen
                zones={ZONES_DATA}
                profile={profile}
                onSelectStage={handleStartStage}
              />
            )}

            {currentTab === 'arcade' && (
              <ArcadeScreen
                zones={ZONES_DATA}
                onPlayStage={handleStartStage}
              />
            )}

            {currentTab === 'rewards' && (
              <RewardsCenterScreen
                profile={profile}
                parentRewards={parentConfig.rewards}
                parentConfig={parentConfig}
                onRefreshProfile={refreshProfileState}
                onOpenExchangeModal={() => setShowExchangeModal(true)}
              />
            )}

            {currentTab === 'review' && (
              <SmartReviewScreen
                profile={profile}
                onRefreshProfile={refreshProfileState}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Thumb Navigation Bar */}
      {!activeStage && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          unresolvedMistakesCount={unresolvedMistakes}
        />
      )}

      {/* Parent Dashboard Modal */}
      <ParentDashboardModal
        isOpen={showParentModal}
        onClose={() => {
          setShowParentModal(false);
          refreshProfileState();
        }}
        profile={profile}
        onUpdateProfile={refreshProfileState}
      />

      {/* Player Profile & Badges Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          refreshProfileState();
        }}
        profile={profile}
        onUpdateProfile={refreshProfileState}
      />

      {/* Real Cash Exchange Modal */}
      <CashExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        profile={profile}
        parentConfig={parentConfig}
        onExchangeSuccess={refreshProfileState}
      />

      {/* First Time Character Creation & Cinematic Intro */}
      <IntroCreationModal
        isOpen={showIntroModal}
        onComplete={() => {
          setShowIntroModal(false);
          refreshProfileState();
        }}
      />

      {/* Real-time Voice Narrator Subtitles and Wave Bar */}
      <VoiceNarrationBar />
    </div>
  );
}
