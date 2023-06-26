FROM klaemo/couchdb

# Add admin to local.ini file
RUN "SC7639 = -pbkdf2-310d7d320cc8bab44911978f57ab7141d311adc5,13cccbd7e4e2dc7c4ccfdb54765e1f93,10" >> /usr/local/etc/couchdb/local.ini

ENTRYPOINT ["/entrypoint.sh"]
CMD ["couchdb"]
