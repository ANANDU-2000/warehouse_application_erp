import 'package:shared_preferences/shared_preferences.dart';

/// Remembers last supplier/broker/type on catalog item create (per business).
class CatalogCreatePrefs {
  static String _supplierKey(String businessId) =>
      'catalog_create_supplier_$businessId';
  static String _brokerKey(String businessId) =>
      'catalog_create_broker_$businessId';
  static String _typeKey(String businessId) => 'catalog_create_type_$businessId';

  static Future<
      ({
        String? supplierId,
        String? brokerId,
        String? typeId,
      })> load(String businessId) async {
    final sp = await SharedPreferences.getInstance();
    return (
      supplierId: sp.getString(_supplierKey(businessId)),
      brokerId: sp.getString(_brokerKey(businessId)),
      typeId: sp.getString(_typeKey(businessId)),
    );
  }

  static Future<void> save({
    required String businessId,
    String? supplierId,
    String? brokerId,
    String? typeId,
  }) async {
    final sp = await SharedPreferences.getInstance();
    final sup = supplierId?.trim();
    final bro = brokerId?.trim();
    final typ = typeId?.trim();
    if (sup == null || sup.isEmpty) {
      await sp.remove(_supplierKey(businessId));
    } else {
      await sp.setString(_supplierKey(businessId), sup);
    }
    if (bro == null || bro.isEmpty) {
      await sp.remove(_brokerKey(businessId));
    } else {
      await sp.setString(_brokerKey(businessId), bro);
    }
    if (typ == null || typ.isEmpty) {
      await sp.remove(_typeKey(businessId));
    } else {
      await sp.setString(_typeKey(businessId), typ);
    }
  }
}
