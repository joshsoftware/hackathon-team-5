class CreateUrls < ActiveRecord::Migration[6.1]
  enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

  def change
    create_table :urls do |t|
      t.uuid :uid, null: false, default: -> { 'gen_random_uuid()' }, index: { unique: true }
      t.uuid :action_uid
      t.string :link
      t.timestamps
    end

    add_foreign_key :urls, :actions, column: :action_uid, primary_key: :uid
  end
end
