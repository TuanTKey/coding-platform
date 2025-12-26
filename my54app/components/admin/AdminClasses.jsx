import { View, Text } from 'react-native';

export default function AdminClasses() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>Quản lý lớp học (Admin)</Text>
      {/* Danh sách, thêm, sửa, xóa lớp học sẽ được thêm ở đây */}
    </View>
  );
}
