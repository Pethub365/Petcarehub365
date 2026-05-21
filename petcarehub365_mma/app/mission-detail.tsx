import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MissionDetailScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dạy đi vệ sinh đúng chỗ</Text>
        <TouchableOpacity style={styles.backBtn}>
            <IconSymbol name="square.and.arrow.up" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.videoPlayer}>
              <View style={styles.videoPlaceholder}>
                  <IconSymbol name="play.circle.fill" size={64} color="#fff" style={{opacity: 0.8}} />
              </View>
              <View style={styles.videoControls}>
                  <Text style={styles.timeText}>0:37</Text>
                  <View style={styles.timeBar}><View style={styles.timeFill} /></View>
                  <Text style={styles.timeText}>2:23</Text>
              </View>
          </View>

          <Text style={styles.sectionTitle}>Các bước thực hiện</Text>
          
          <View style={styles.stepList}>
              <View style={styles.stepItem}>
                  <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
                  <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>Chọn khu vực cố định</Text>
                      <Text style={styles.stepDesc}>Xác định nơi bạn muốn thú cưng đi vệ sinh, có thể là khay vệ sinh hoặc tấm lót chuyên dụng.</Text>
                  </View>
              </View>

              <View style={styles.stepItem}>
                  <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
                  <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>Theo dõi lịch trình ăn uống</Text>
                      <Text style={styles.stepDesc}>Dắt thú cưng ra khu vực vệ sinh ngay sau khi ăn 15-20 phút hoặc ngay sau khi ngủ dậy.</Text>
                  </View>
              </View>

              <View style={styles.stepItem}>
                  <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
                  <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>Khen thưởng ngay lập tức</Text>
                      <Text style={styles.stepDesc}>Sử dụng bánh thưởng (treat) hoặc lời khen hào hứng khi cún làm đúng chỗ.</Text>
                  </View>
              </View>
          </View>

          <View style={styles.tipsBox}>
              <View style={styles.tipsHeader}>
                  <IconSymbol name="lightbulb.fill" size={16} color="#FF9800" />
                  <Text style={styles.tipsTitle}>MẸO NHỎ CHO BẠN</Text>
              </View>
              <View style={styles.tipRow}><Text style={styles.tipBullet}>•</Text><Text style={styles.tipText}>Kiên trì là chìa khóa, đừng bao giờ mắng mỏ khi chúng lỡ làm sai.</Text></View>
              <View style={styles.tipRow}><Text style={styles.tipBullet}>•</Text><Text style={styles.tipText}>Vệ sinh sạch sẽ chỗ cũ nếu cún đi sai để xóa mùi hương.</Text></View>
          </View>

      </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
              <IconSymbol name="checkmark.circle" size={20} color="#fff" />
              <Text style={styles.doneBtnText}>Xác nhận hoàn thành</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  
  videoPlayer: { width: '100%', height: 220, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', marginBottom: 30, position: 'relative' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoControls: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  timeBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  timeFill: { width: '30%', height: '100%', backgroundColor: '#FF4D4D', borderRadius: 2 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  stepList: { gap: 24, marginBottom: 30 },
  stepItem: { flexDirection: 'row', gap: 16 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  stepDesc: { fontSize: 13, color: '#666', lineHeight: 20 },

  tipsBox: { backgroundColor: '#FFF5F5', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#FFEBEB' },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipsTitle: { fontSize: 13, fontWeight: 'bold', color: '#FF9800' },
  tipRow: { flexDirection: 'row', marginBottom: 8 },
  tipBullet: { fontSize: 18, color: '#FF4D4D', marginRight: 8, lineHeight: 20 },
  tipText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  doneBtn: { backgroundColor: '#FF4D4D', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
