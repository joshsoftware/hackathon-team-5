class CreateActions < ActiveRecord::Migration[6.1]
  enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

  def change
    create_table :actions do |t|
      t.uuid :uid, null: false, default: -> { 'gen_random_uuid()' }, index: { unique: true }
      t.integer :flow
      t.timestamps
    end
  end
end
