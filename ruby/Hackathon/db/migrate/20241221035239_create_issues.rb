class CreateIssues < ActiveRecord::Migration[6.1]
  enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

  def change
    create_table :issues do |t|
      t.uuid :uid, null: false, default: -> { 'gen_random_uuid()' }, index: { unique: true }
      t.uuid :url_uid
      t.uuid :action_uid
      t.jsonb :issue, array: true, default: []
      t.integer :error_type
      t.timestamps
    end

    add_foreign_key :issues, :actions, column: :action_uid, primary_key: :uid
    add_foreign_key :issues, :urls, column: :url_uid, primary_key: :uid
  end
end
